/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express-serve-static-core';
import { MessageType } from '../common/entities/gql/message.type';
import { IMessage } from '../common/interfaces/message.interface';
import { isUndefined } from '../common/utils/validation.util';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GqlReq } from './decorators/gql-req.decorator';
import { GqlRes } from './decorators/gql-res.decorator';
import { Origin } from './decorators/origin.decorator';
import { Public } from './decorators/public.decorator';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { AuthType } from './entities/gql/auth.type';
import { ResetPasswordInput } from './inputs/reset-password.input';
import { SignInInput } from './inputs/sign-in.input';
import { SignUpInput } from './inputs/sign-up.input';
import { UpdatePasswordInput } from './inputs/update-password.input';

@Resolver(() => AuthType)
export class AuthResolver {
  private readonly cookiePath = '/api/graphql';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<boolean>('testing');
  }

  @Public()
  @Mutation(() => MessageType)
  public async signUp(
    @Origin() origin: string | undefined,
    @Args('input') signUpInput: SignUpInput,
  ): Promise<IMessage> {
    return await this.authService.signUp(signUpInput, origin);
  }

  @Public()
  @Mutation(() => AuthType)
  public async signIn(
    @GqlRes() res: Response,
    @Origin() origin: string | undefined,
    @Args('input') signInInput: SignInInput,
  ): Promise<AuthType> {
    const { refreshToken, ...authType } = await this.authService.signIn(
      signInInput,
      origin,
    );
    this.saveRefreshCookie(res, refreshToken);
    return authType;
  }

  @Public()
  @Mutation(() => AuthType)
  public async refreshAccess(
    @GqlReq() req: Request,
    @GqlRes() res: Response,
  ): Promise<AuthType> {
    const token = this.refreshTokenFromReq(req);
    const { refreshToken, ...authType } =
      await this.authService.refreshTokenAccess(token, req.headers.origin);
    this.saveRefreshCookie(res, refreshToken);
    return authType;
  }

  @Mutation(() => MessageType)
  public async logout(
    @GqlReq() req: Request,
    @GqlRes() res: Response,
  ): Promise<IMessage> {
    const token = this.refreshTokenFromReq(req);
    res.clearCookie(this.cookieName);
    return this.authService.logout(token);
  }

  @Public()
  @Mutation(() => AuthType)
  public async confirmEmail(
    @Origin() origin: string | undefined,
    @Args() confirmEmailDto: ConfirmEmailDto,
    @GqlRes() res: Response,
  ) {
    const { refreshToken, ...authType } = await this.authService.confirmEmail(
      confirmEmailDto,
    );
    this.saveRefreshCookie(res, refreshToken);
    return authType;
  }

  @Public()
  @Mutation(() => MessageType)
  public async forgotPassword(
    @Origin() origin: string | undefined,
    @Args() emailDto: EmailDto,
  ): Promise<IMessage> {
    return await this.authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Mutation(() => MessageType)
  public async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<IMessage> {
    return await this.authService.resetPassword(input);
  }

  @Mutation(() => AuthType)
  public async updatePassword(
    @CurrentUser() id: number,
    @Origin() origin: string | undefined,
    @Args('input') input: UpdatePasswordInput,
    @GqlRes() res: Response,
  ): Promise<AuthType> {
    const { refreshToken, ...authType } = await this.authService.updatePassword(
      id,
      input,
      origin,
    );
    this.saveRefreshCookie(res, refreshToken);
    return authType;
  }

  @Query(() => UserEntity)
  public async me(@CurrentUser() id: number): Promise<UserEntity> {
    return await this.usersService.findOneById(id);
  }

  private refreshTokenFromReq(req: Request): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(this.cookieName, refreshToken, {
      secure: !this.testing,
      httpOnly: true,
      signed: true,
      path: this.cookiePath,
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }
}
