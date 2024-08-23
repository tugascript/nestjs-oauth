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

import { faker } from '@faker-js/faker';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from '../../common/common.module';
import { CommonService } from '../../common/common.service';
import { config } from '../../config';
import { validationSchema } from '../../config/config.schema';
import { MikroOrmConfig } from '../../config/mikroorm.config';
import { JwtModule } from '../../jwt/jwt.module';
import { UserEntity } from '../../users/entities/user.entity';
import { OAuthProvidersEnum } from '../../users/enums/oauth-providers.enum';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { Oauth2Service } from '../oauth2.service';

describe('Oauth2Service', () => {
  let module: TestingModule,
    oauth2Service: Oauth2Service,
    usersService: UsersService,
    commonService: CommonService,
    orm: MikroORM;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          load: [config],
        }),
        CacheModule.register({
          isGlobal: true,
          ttl: parseInt(process.env.JWT_REFRESH_TIME, 10),
        }),
        MikroOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: MikroOrmConfig,
        }),
        CommonModule,
        UsersModule,
        JwtModule,
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      providers: [Oauth2Service, CommonModule],
    }).compile();

    oauth2Service = module.get<Oauth2Service>(Oauth2Service);
    usersService = module.get<UsersService>(UsersService);
    commonService = module.get<CommonService>(CommonService);
    orm = module.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().createSchema();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(oauth2Service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(commonService).toBeDefined();
    expect(orm).toBeDefined();
  });

  describe('getAuthorizationUrl', () => {
    it('should return the microsoft authorization url', async () => {
      const url = await oauth2Service.getAuthorizationUrl(
        OAuthProvidersEnum.MICROSOFT,
      );
      expect(url).toBeDefined();
      expect(url).toContain(
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      );
    });
    it('should return the google authorization url', async () => {
      const url = await oauth2Service.getAuthorizationUrl(
        OAuthProvidersEnum.GOOGLE,
      );
      expect(url).toBeDefined();
      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    });
    it('should return the facebook authorization url', async () => {
      const url = await oauth2Service.getAuthorizationUrl(
        OAuthProvidersEnum.FACEBOOK,
      );
      expect(url).toBeDefined();
      expect(url).toContain('https://facebook.com/v9.0/dialog/oauth');
    });
    it('should return the github authorization url', async () => {
      const url = await oauth2Service.getAuthorizationUrl(
        OAuthProvidersEnum.GITHUB,
      );
      expect(url).toBeDefined();
      expect(url).toContain('https://github.com/login/oauth/authorize');
    });
  });

  describe('callback', () => {
    it('should create a new user', async () => {
      const email = faker.internet.email();
      const name = faker.person.fullName();
      const code = await oauth2Service.callback(
        OAuthProvidersEnum.GOOGLE,
        email,
        name,
      );

      expect(code).toBeDefined();
      expect(code.length).toBe(22);

      const user = await usersService.findOneByEmail(email);
      expect(user).toBeDefined();
      expect(user.confirmed).toBeTruthy();

      const providers = await usersService.findOAuthProviders(user.id);
      expect(providers).toBeDefined();
      expect(providers).toHaveLength(1);
      expect(providers[0].provider).toBe(OAuthProvidersEnum.GOOGLE);
    });

    it('should login an existing user', async () => {
      const email = faker.internet.email();
      const name = faker.person.fullName();
      await usersService.create(OAuthProvidersEnum.GOOGLE, email, name);
      const code = await oauth2Service.callback(
        OAuthProvidersEnum.MICROSOFT,
        email,
        name,
      );

      expect(code).toBeDefined();
      expect(code.length).toBe(22);

      const user = await usersService.findOneByEmail(email);
      expect(user).toBeDefined();
      expect(user.confirmed).toBeTruthy();
      const providers = await usersService.findOAuthProviders(user.id);
      expect(providers).toBeDefined();
      expect(providers).toHaveLength(2);
      expect(providers[0].provider).toBe(OAuthProvidersEnum.GOOGLE);
      expect(providers[1].provider).toBe(OAuthProvidersEnum.MICROSOFT);
    });
  });

  describe('token', () => {
    it('should return access and refresh tokens from callback code', async () => {
      const email = faker.internet.email();
      const name = faker.person.fullName();
      const code = await oauth2Service.callback(
        OAuthProvidersEnum.MICROSOFT,
        email,
        name,
      );

      const result = await oauth2Service.token(code);

      expect(result).toMatchObject({
        user: expect.any(UserEntity),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should throw an unauthorized exception for invalid callback code', async () => {
      const code = '7IHq0AGB7FOL25kt8WejRz';

      await expect(oauth2Service.token(code)).rejects.toThrow(
        new UnauthorizedException('Code is invalid or expired'),
      );
    });
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close(true);
    await module.close();
  });
});
