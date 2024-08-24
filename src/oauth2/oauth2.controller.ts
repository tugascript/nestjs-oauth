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

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { Public } from '../auth/decorators/public.decorator';
import { FastifyThrottlerGuard } from '../auth/guards/fastify-throttler.guard';
import { AuthResponseMapper } from '../auth/mappers/auth-response.mapper';
import { OAuthProvidersEnum } from '../users/enums/oauth-providers.enum';
import { CallbackQueryDto } from './dtos/callback-query.dto';
import { TokenDto } from './dtos/token.dto';
import { OAuthFlagGuard } from './guards/oauth-flag.guard';
import {
  IFacebookUser,
  IGitHubUser,
  IGoogleUser,
  IMicrosoftUser,
} from './interfaces/user-response.interface';
import { Oauth2Service } from './oauth2.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Oauth2')
@Controller('api/auth/ext')
@UseGuards(FastifyThrottlerGuard)
export class Oauth2Controller {
  private readonly url: string;
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly oauth2Service: Oauth2Service,
    private readonly configService: ConfigService,
  ) {
    this.url = `https://${this.configService.get<string>('domain')}`;
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<boolean>('testing');
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.MICROSOFT))
  @Get('microsoft')
  @ApiResponse({
    description: 'Redirects to Microsoft OAuth2 login page',
    status: HttpStatus.TEMPORARY_REDIRECT,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Microsoft',
  })
  public async microsoft(@Res() res: FastifyReply): Promise<FastifyReply> {
    return this.startRedirect(res, OAuthProvidersEnum.MICROSOFT);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.MICROSOFT))
  @Get('microsoft/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.ACCEPTED,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Microsoft',
  })
  public async microsoftCallback(
    @Query() cbQuery: CallbackQueryDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const provider = OAuthProvidersEnum.MICROSOFT;
    const { displayName, mail } =
      await this.oauth2Service.getUserData<IMicrosoftUser>(provider, cbQuery);
    return this.callbackAndRedirect(res, provider, mail, displayName);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GOOGLE))
  @Get('google')
  @ApiResponse({
    description: 'Redirects to Google OAuth2 login page',
    status: HttpStatus.TEMPORARY_REDIRECT,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Google',
  })
  public async google(@Res() res: FastifyReply): Promise<FastifyReply> {
    return this.startRedirect(res, OAuthProvidersEnum.GOOGLE);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GOOGLE))
  @Get('google/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.ACCEPTED,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Google',
  })
  public async googleCallback(
    @Query() cbQuery: CallbackQueryDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const provider = OAuthProvidersEnum.GOOGLE;
    const { name, email } = await this.oauth2Service.getUserData<IGoogleUser>(
      provider,
      cbQuery,
    );
    return this.callbackAndRedirect(res, provider, email, name);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.FACEBOOK))
  @Get('facebook')
  @ApiResponse({
    description: 'Redirects to Facebook OAuth2 login page',
    status: HttpStatus.TEMPORARY_REDIRECT,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Facebook',
  })
  public async facebook(@Res() res: FastifyReply): Promise<FastifyReply> {
    return this.startRedirect(res, OAuthProvidersEnum.FACEBOOK);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.FACEBOOK))
  @Get('facebook/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.ACCEPTED,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for Facebook',
  })
  public async facebookCallback(
    @Query() cbQuery: CallbackQueryDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const provider = OAuthProvidersEnum.FACEBOOK;
    const { name, email } = await this.oauth2Service.getUserData<IFacebookUser>(
      provider,
      cbQuery,
    );
    return this.callbackAndRedirect(res, provider, email, name);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GITHUB))
  @Get('github')
  @ApiResponse({
    description: 'Redirects to GitHub OAuth2 login page',
    status: HttpStatus.TEMPORARY_REDIRECT,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for GitHub',
  })
  public async github(@Res() res: FastifyReply): Promise<FastifyReply> {
    return this.startRedirect(res, OAuthProvidersEnum.GITHUB);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GITHUB))
  @Get('github/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.ACCEPTED,
  })
  @ApiNotFoundResponse({
    description: 'OAuth2 is not enabled for GitHub',
  })
  public async githubCallback(
    @Query() cbQuery: CallbackQueryDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const provider = OAuthProvidersEnum.GITHUB;
    const { name, email } = await this.oauth2Service.getUserData<IGitHubUser>(
      provider,
      cbQuery,
    );
    return this.callbackAndRedirect(res, provider, email, name);
  }

  @Post('token')
  @ApiResponse({
    description: "Returns the user's OAuth 2 response",
    status: HttpStatus.OK,
  })
  @ApiUnauthorizedResponse({
    description: 'Code or redirectUri is invalid',
  })
  public async token(
    @CurrentUser() userId: number,
    @Body() tokenDto: TokenDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    if (tokenDto.redirectUri !== this.url + '/auth/callback') {
      throw new UnauthorizedException();
    }

    const result = await this.oauth2Service.token(tokenDto.code, userId);
    return res
      .cookie(this.cookieName, result.refreshToken, {
        secure: !this.testing,
        httpOnly: true,
        signed: true,
        path: this.cookiePath,
        expires: new Date(Date.now() + this.refreshTime * 1000),
      })
      .header('Content-Type', 'application/json')
      .status(HttpStatus.OK)
      .send(AuthResponseMapper.map(result));
  }

  private async startRedirect(
    res: FastifyReply,
    provider: OAuthProvidersEnum,
  ): Promise<FastifyReply> {
    return res
      .status(HttpStatus.TEMPORARY_REDIRECT)
      .redirect(await this.oauth2Service.getAuthorizationUrl(provider));
  }

  private async callbackAndRedirect(
    res: FastifyReply,
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ): Promise<FastifyReply> {
    const { code, accessToken, expiresIn } = await this.oauth2Service.callback(
      provider,
      email,
      name,
    );
    const urlSearchParams = new URLSearchParams({
      code,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresIn.toString(),
    });

    return res
      .status(HttpStatus.ACCEPTED)
      .redirect(`${this.url}/auth/callback?${urlSearchParams.toString()}`);
  }
}
