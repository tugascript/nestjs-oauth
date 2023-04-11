/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiNotFoundResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { Public } from '../auth/decorators/public.decorator';
import { FastifyThrottlerGuard } from '../auth/guards/fastify-throttler.guard';
import { OAuthProvidersEnum } from '../users/enums/oauth-providers.enum';
import { CallbackQueryDto } from './dtos/callback-query.dto';
import { OAuthFlagGuard } from './guards/oauth-flag.guard';
import {
  IFacebookUser,
  IGitHubUser,
  IGoogleUser,
  IMicrosoftUser,
} from './interfaces/user-response.interface';
import { Oauth2Service } from './oauth2.service';

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
    this.url = `https://${this.configService.get<string>('DOMAIN')}`;
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
  public microsoft(@Res() res: FastifyReply): FastifyReply {
    return this.startRedirect(res, OAuthProvidersEnum.MICROSOFT);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.MICROSOFT))
  @Get('microsoft/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.PERMANENT_REDIRECT,
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
    return this.loginAndRedirect(res, provider, mail, displayName);
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
  public google(@Res() res: FastifyReply): FastifyReply {
    return this.startRedirect(res, OAuthProvidersEnum.GOOGLE);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GOOGLE))
  @Get('google/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.PERMANENT_REDIRECT,
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
    return this.loginAndRedirect(res, provider, email, name);
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
  public facebook(@Res() res: FastifyReply): FastifyReply {
    return this.startRedirect(res, OAuthProvidersEnum.FACEBOOK);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.FACEBOOK))
  @Get('facebook/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.PERMANENT_REDIRECT,
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
    return this.loginAndRedirect(res, provider, email, name);
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
  public github(@Res() res: FastifyReply): FastifyReply {
    return this.startRedirect(res, OAuthProvidersEnum.GITHUB);
  }

  @Public()
  @UseGuards(OAuthFlagGuard(OAuthProvidersEnum.GITHUB))
  @Get('github/callback')
  @ApiResponse({
    description: 'Redirects to the frontend with the JWT token',
    status: HttpStatus.PERMANENT_REDIRECT,
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
    return this.loginAndRedirect(res, provider, email, name);
  }

  private startRedirect(
    res: FastifyReply,
    provider: OAuthProvidersEnum,
  ): FastifyReply {
    return res
      .status(HttpStatus.TEMPORARY_REDIRECT)
      .redirect(this.oauth2Service.getAuthorizationUrl(provider));
  }

  private async loginAndRedirect(
    res: FastifyReply,
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ): Promise<FastifyReply> {
    const [accessToken, refreshToken] = await this.oauth2Service.login(
      provider,
      email,
      name,
    );
    return res
      .cookie(this.cookieName, refreshToken, {
        secure: !this.testing,
        httpOnly: true,
        signed: true,
        path: this.cookiePath,
        expires: new Date(Date.now() + this.refreshTime * 1000),
      })
      .status(HttpStatus.PERMANENT_REDIRECT)
      .redirect(`${this.url}/?access_token=${accessToken}`);
  }
}
