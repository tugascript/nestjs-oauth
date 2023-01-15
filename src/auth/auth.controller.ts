/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { IMessage } from '../common/interfaces/message.interface';
import { isUndefined } from '../common/utils/validation.util';
import { IUser } from '../users/interfaces/user.interface';
import { AuthService } from './auth.service';
import { Origin } from './decorators/origin.decorator';
import { Public } from './decorators/public.decorator';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { IAuthResUser } from './interfaces/auth-response-user.interface';
import { IAuthResponse } from './interfaces/auth-response.interface';
import { IAuthResult } from './interfaces/auth-result.interface';

@Controller('api/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('COOKIE_NAME');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<boolean>('testing');
  }

  private static mapUser(user: IUser): IAuthResUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private static mapAuthResult(result: IAuthResult): IAuthResponse {
    return {
      user: AuthController.mapUser(result.user),
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('/sign-up')
  public async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ): Promise<IMessage> {
    return this.authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('/sign-in')
  public async signIn(
    @Res() res: Response,
    @Origin() origin: string | undefined,
    @Body() singInDto: SignInDto,
  ): Promise<void> {
    const result = await this.authService.signIn(singInDto, origin);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(200)
      .send(AuthController.mapAuthResult(result));
  }

  @Public()
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const result = await this.authService.refreshTokenAccess(
      token,
      req.headers.origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(200)
      .send(AuthController.mapAuthResult(result));
  }

  @Post('/logout')
  public async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(200)
      .send(message);
  }

  @Public()
  @Post('/confirm-email')
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.confirmEmail(confirmEmailDto);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(200)
      .send(AuthController.mapAuthResult(result));
  }

  @Public()
  @Post('/reset-password-email')
  public async resetPasswordEmail(
    @Origin() origin: string | undefined,
    @Body() emailDto: EmailDto,
  ): Promise<IMessage> {
    return this.authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Post('/reset-password')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IMessage> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  private refreshTokenFromReq(req: Request): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): Response {
    return res.cookie(this.cookieName, refreshToken, {
      secure: !this.testing,
      httpOnly: true,
      sameSite: 'strict',
      signed: true,
      path: this.cookiePath,
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }
}
