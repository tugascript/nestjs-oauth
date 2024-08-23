/*
 Copyright (C) 2024 Afonso Barracha

 Nest OAuth is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Nest OAuth is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with Nest OAuth.  If not, see <https://www.gnu.org/licenses/>.
*/

import fastifyCookie from '@fastify/cookie';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { OAuthProvidersEnum } from '../src/users/enums/oauth-providers.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Oauth2Service } from '../src/oauth2/oauth2.service';
import nock from 'nock';
import { faker } from '@faker-js/faker';
import { CommonService } from '../src/common/common.service';

const URLS = {
  [OAuthProvidersEnum.MICROSOFT]: {
    authorizeHost: 'https://login.microsoftonline.com',
    authorizePath: '/common/oauth2/v2.0/authorize',
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: '/common/oauth2/v2.0/token',
    userUrl: 'https://graph.microsoft.com/v1.0/me',
  },
  [OAuthProvidersEnum.GOOGLE]: {
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
  },
  [OAuthProvidersEnum.GITHUB]: {
    authorizeHost: 'https://github.com',
    authorizePath: '/login/oauth/authorize',
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
  },
};

describe('OAuth2 (e2e)', () => {
  let app: NestFastifyApplication,
    configService: ConfigService,
    cacheManager: Cache,
    oauth2Service: Oauth2Service,
    commonService: CommonService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    configService = app.get(ConfigService);
    cacheManager = app.get<Cache>(CACHE_MANAGER);
    oauth2Service = app.get(Oauth2Service);
    commonService = app.get(CommonService);

    await app.register(fastifyCookie, {
      secret: configService.get<string>('COOKIE_SECRET'),
    });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  const baseUrl = '/api/auth/ext';

  describe.each([
    OAuthProvidersEnum.GOOGLE,
    OAuthProvidersEnum.GITHUB,
    OAuthProvidersEnum.MICROSOFT,
  ])(`%s`, (provider) => {
    describe(`GET /api/auth/ext/${provider}`, () => {
      it('should return 307 temporary redirect', async () => {
        const authorizationUrl = `${baseUrl}/${provider}`;
        const redirectUrl =
          URLS[provider].authorizeHost + URLS[provider].authorizePath;

        return request(app.getHttpServer())
          .get(authorizationUrl)
          .expect(HttpStatus.TEMPORARY_REDIRECT)
          .expect((res) => {
            expect(res.headers.location.startsWith(redirectUrl)).toBe(true);
          });
      });
    });

    describe(`GET /api/auth/ext/${provider}/callback`, () => {
      const callbackPath = `${baseUrl}/${provider}/callback`;
      const state = '6618ff2967f04817a905a345d288d12d';
      const code = '0mQzI6CUWhzMm33dszX9et';
      const accessToken = 'some-access-token';
      const refreshToken = 'some-refresh-token';
      const host = URLS[provider].tokenHost;
      const path = URLS[provider].tokenPath;
      const userUrl = URLS[provider].userUrl;

      const name = faker.person.fullName();
      const email = faker.internet.email().toLowerCase();

      it('should return 202 accepted and redirect with code', async () => {
        const frontendUrl = `https://${configService.get<string>('domain')}/callback?code=`;
        await cacheManager.set(`oauth_state:${state}`, provider, 120_000);
        const tokenScope = nock(host, {
          reqheaders: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
          .post(
            path,
            (body) =>
              body.grant_type === 'authorization_code' &&
              body.code === code &&
              body.redirect_uri.includes(callbackPath),
          )
          .reply(200, {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
          });
        const userScope = nock(userUrl, {
          reqheaders: {
            accept: 'application/json',
            authorization: `Bearer ${accessToken}`,
          },
        })
          .get('')
          .reply(
            200,
            provider === OAuthProvidersEnum.MICROSOFT
              ? {
                  displayName: name,
                  mail: email,
                }
              : {
                  name,
                  email,
                },
          );

        await request(app.getHttpServer())
          .get(`${callbackPath}?code=${code}&state=${state}`)
          .expect(HttpStatus.ACCEPTED)
          .expect((res) => {
            expect(res.headers.location.startsWith(frontendUrl)).toBe(true);
            expect(res.headers.location.split('?code=')[1].length).toBe(22);
          });

        expect(tokenScope.isDone()).toBe(true);
        expect(userScope.isDone()).toBe(true);
      });

      it('should return 401 unauthorized when the code is wrong', async () => {
        await cacheManager.set(`oauth_state:${state}`, provider, 120_000);
        const tokenScope = nock(host, {
          reqheaders: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
          .post(
            path,
            (body) =>
              body.grant_type === 'authorization_code' &&
              body.code === code &&
              body.redirect_uri.includes(callbackPath),
          )
          .reply(401, { code: 'Unauthorized' });

        await request(app.getHttpServer())
          .get(`${callbackPath}?code=${code}&state=${state}`)
          .expect(HttpStatus.UNAUTHORIZED);

        expect(tokenScope.isDone()).toBe(true);
      });

      it('should return 401 unauthorized when the state is expired or non-existent', async () => {
        await cacheManager.del(`oauth_state:${state}`);
        const tokenScope = nock(host, {
          reqheaders: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
          .post(
            path,
            (body) =>
              body.grant_type === 'authorization_code' &&
              body.code === code &&
              body.redirect_uri.includes(callbackPath),
          )
          .reply(200);

        await request(app.getHttpServer())
          .get(`${callbackPath}?code=${code}&state=${state}`)
          .expect(HttpStatus.UNAUTHORIZED);

        expect(tokenScope.isDone()).toBe(false);
      });
    });

    describe('POST /api/auth/ext/token', () => {
      const tokenPath = `${baseUrl}/token`;
      const name = faker.person.fullName();
      const email = faker.internet.email().toLowerCase();

      it('should return 200 OK with access and refresh token', async () => {
        const code = await oauth2Service.callback(provider, email, name);

        return request(app.getHttpServer())
          .post(tokenPath)
          .send({ code })
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toMatchObject({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
              expiresIn: expect.any(Number),
              tokenType: 'Bearer',
              user: {
                id: expect.any(Number),
                name: commonService.formatName(name),
                username: commonService.generatePointSlug(name),
                email,
              },
            });
          });
      });

      it('should return 401 UNAUTHORIZED when the code is expired', async () => {
        const code = await oauth2Service.callback(provider, email, name);
        await cacheManager.del(`oauth_code:${code}`);

        return request(app.getHttpServer())
          .post(tokenPath)
          .send({ code })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
  });
});
