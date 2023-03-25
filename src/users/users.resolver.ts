/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ConfigService } from '@nestjs/config';
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { Response } from 'express-serve-static-core';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IdDto } from '../common/dtos/id.dto';
import { MessageType } from '../common/entities/gql/message.type';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { NameDto } from './dtos/name.dto';
import { PasswordDto } from './dtos/password.dto';
import { UsernameDto } from './dtos/username.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { IFederatedInstance } from '../common/interfaces/federated-instance.interface';

@Resolver(() => UserEntity)
export class UsersResolver {
  private readonly cookiePath = '/api/graphql';
  private readonly cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
  }

  @Public()
  @Query(() => UserEntity)
  public async userById(@Args() idDto: IdDto): Promise<UserEntity> {
    return await this.usersService.findOneById(idDto.id);
  }

  @Public()
  @Query(() => UserEntity)
  public async userByUsername(
    @Args() usernameDto: UsernameDto,
  ): Promise<UserEntity> {
    return await this.usersService.findOneByUsername(usernameDto.username);
  }

  @Mutation(() => UserEntity)
  public async updateUserEmail(
    @CurrentUser() id: number,
    @Args() changeEmailDto: ChangeEmailDto,
  ): Promise<UserEntity> {
    return await this.usersService.updateEmail(id, changeEmailDto);
  }

  @Mutation(() => UserEntity)
  public async updateUserName(
    @CurrentUser() id: number,
    @Args() nameDto: NameDto,
  ): Promise<UserEntity> {
    return await this.usersService.updateName(id, nameDto.name);
  }

  @Mutation(() => UserEntity)
  public async updateUserUsername(
    @CurrentUser() id: number,
    @Args() usernameDto: UsernameDto,
  ): Promise<UserEntity> {
    return await this.usersService.updateUsername(id, usernameDto.username);
  }

  @Mutation(() => MessageType)
  public async deleteUser(
    @Context('res') res: Response,
    @CurrentUser() id: number,
    @Args() passwordDto: PasswordDto,
  ): Promise<MessageType> {
    await this.usersService.delete(id, passwordDto);
    res.clearCookie(this.cookieName, { path: this.cookiePath });
    return new MessageType('User deleted successfully');
  }

  @ResolveReference()
  public async resolveReference(
    reference: IFederatedInstance<'User'>,
  ): Promise<UserEntity> {
    return this.usersService.findOneById(reference.id);
  }
}
