/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IAuthResUser } from '../auth/interfaces/auth-response-user.interface';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { PasswordDto } from './dtos/password.dto';
import { UsernameDto } from './dtos/username.dto';
import { IResUser } from './interfaces/response-user.interface';
import { IUser } from './interfaces/user.interface';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('COOKIE_NAME');
  }

  private static mapUser(user: IUser): IResUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Public()
  @Get('/:idOrUsername')
  public async getUser(
    @Param('idOrUsername') idOrUsername: string,
  ): Promise<IResUser> {
    const user = await this.usersService.findOneByIdOrUsername(idOrUsername);
    return UsersController.mapUser(user);
  }

  @Get('/me')
  public async getMe(@CurrentUser() id: number): Promise<IAuthResUser> {
    const user = await this.usersService.findOneById(id);
    return {
      ...UsersController.mapUser(user),
      email: user.email,
    };
  }

  @Patch('/email')
  public async updateEmail(
    @CurrentUser() id: number,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResUser> {
    const user = await this.usersService.updateEmail(id, dto);
    return {
      ...UsersController.mapUser(user),
      email: user.email,
    };
  }

  @Patch('/username')
  public async updateUsername(
    @CurrentUser() id: number,
    @Body() dto: UsernameDto,
  ): Promise<IResUser> {
    const user = await this.usersService.updateUsername(id, dto);
    return UsersController.mapUser(user);
  }

  @Delete()
  public async deleteUser(
    @CurrentUser() id: number,
    @Body() dto: PasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(204)
      .send();
  }
}
