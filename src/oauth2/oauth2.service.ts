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

import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { v4 } from 'uuid';
import { IAuthResult } from '../auth/interfaces/auth-result.interface';
import { CommonService } from '../common/common.service';
import { isNull } from '../common/utils/validation.util';
import { JwtService } from '../jwt/jwt.service';
import { OAuthProvidersEnum } from '../users/enums/oauth-providers.enum';
import { UsersService } from '../users/users.service';
import { OAuthClass } from './classes/oauth.class';
import { ICallbackQuery } from './interfaces/callback-query.interface';
import { IClient } from './interfaces/client.interface';
import { TokenTypeEnum } from '../jwt/enums/token-type.enum';
import { ICallbackResult } from './interfaces/callback-result.interface';

@Injectable()
export class Oauth2Service {
  private static readonly BASE62 =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly BIG62 = BigInt(Oauth2Service.BASE62.length);

  private readonly [OAuthProvidersEnum.MICROSOFT]: OAuthClass | null;
  private readonly [OAuthProvidersEnum.GOOGLE]: OAuthClass | null;
  private readonly [OAuthProvidersEnum.FACEBOOK]: OAuthClass | null;
  private readonly [OAuthProvidersEnum.GITHUB]: OAuthClass | null;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly commonService: CommonService,
  ) {
    const url = configService.get<string>('url');
    this[OAuthProvidersEnum.MICROSOFT] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.MICROSOFT,
      configService,
      url,
    );
    this[OAuthProvidersEnum.GOOGLE] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.GOOGLE,
      configService,
      url,
    );
    this[OAuthProvidersEnum.FACEBOOK] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.FACEBOOK,
      configService,
      url,
    );
    this[OAuthProvidersEnum.GITHUB] = Oauth2Service.setOAuthClass(
      OAuthProvidersEnum.GITHUB,
      configService,
      url,
    );
  }

  private static setOAuthClass(
    provider: OAuthProvidersEnum,
    configService: ConfigService,
    url: string,
  ): OAuthClass | null {
    const client = configService.get<IClient | null>(
      `oauth2.${provider.toLowerCase()}`,
    );

    if (isNull(client)) {
      return null;
    }

    return new OAuthClass(provider, client, url);
  }

  private static getOAuthStateKey(state: string): string {
    return `oauth_state:${state}`;
  }

  private static getOAuthCodeKey(code: string): string {
    return `oauth_code:${code}`;
  }

  private static generateCode(): string {
    let num = BigInt('0x' + v4().replace(/-/g, ''));
    let code = '';

    while (num > 0) {
      const remainder = Number(num % Oauth2Service.BIG62);
      code = Oauth2Service.BASE62[remainder] + code;
      num = num / Oauth2Service.BIG62;
    }

    return code.padStart(22, '0');
  }

  public async getAuthorizationUrl(
    provider: OAuthProvidersEnum,
  ): Promise<string> {
    const [url, state] = this.getOAuth(provider).authorizationUrl;
    await this.commonService.throwInternalError(
      this.cacheManager.set(
        Oauth2Service.getOAuthStateKey(state),
        provider,
        120_000,
      ),
    );
    return url;
  }

  public async getUserData<T extends Record<string, any>>(
    provider: OAuthProvidersEnum,
    cbQuery: ICallbackQuery,
  ): Promise<T> {
    const { code, state } = cbQuery;
    const accessToken = await this.getAccessToken(provider, code, state);
    const userReq = await firstValueFrom(
      this.httpService
        .get<T>(this.getOAuth(provider).dataUrl, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new UnauthorizedException(error.response.data);
          }),
        ),
    );

    if (userReq.status !== HttpStatus.OK) {
      throw new UnauthorizedException();
    }

    return userReq.data;
  }

  public async callback(
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ): Promise<ICallbackResult> {
    const user = await this.usersService.findOrCreate(provider, email, name);

    const code = Oauth2Service.generateCode();
    await this.commonService.throwInternalError(
      this.cacheManager.set(
        Oauth2Service.getOAuthCodeKey(code),
        user.email,
        this.jwtService.accessTime * 1000,
      ),
    );

    const accessToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.ACCESS,
    );
    return {
      code,
      accessToken,
      expiresIn: this.jwtService.accessTime,
    };
  }

  public async token(code: string, userId: number): Promise<IAuthResult> {
    const codeKey = Oauth2Service.getOAuthCodeKey(code);
    const email = await this.commonService.throwInternalError(
      this.cacheManager.get<string>(codeKey),
    );

    if (!email) {
      throw new UnauthorizedException();
    }

    await this.commonService.throwInternalError(this.cacheManager.del(codeKey));
    const user = await this.usersService.findOneByEmail(email);

    if (user.id !== userId) {
      throw new UnauthorizedException();
    }

    const [accessToken, refreshToken] =
      await this.jwtService.generateAuthTokens(user);
    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.jwtService.accessTime,
    };
  }

  private getOAuth(provider: OAuthProvidersEnum): OAuthClass {
    const oauth = this[provider];

    if (isNull(oauth)) {
      throw new NotFoundException('Page not found');
    }

    return oauth;
  }

  private async getAccessToken(
    provider: OAuthProvidersEnum,
    code: string,
    state: string,
  ): Promise<string> {
    const oauth = this.getOAuth(provider);
    const stateProvider = await this.cacheManager.get<OAuthProvidersEnum>(
      Oauth2Service.getOAuthStateKey(state),
    );

    if (!stateProvider || provider !== stateProvider) {
      throw new UnauthorizedException('Corrupted state');
    }

    return await this.commonService.throwUnauthorizedError(
      oauth.getToken(code),
    );
  }
}
