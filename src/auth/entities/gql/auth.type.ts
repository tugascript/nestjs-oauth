/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../../users/entities/user.entity';
import { IUser } from '../../../users/interfaces/user.interface';

@ObjectType('Auth')
export abstract class AuthType {
  @Field(() => UserEntity)
  public user: IUser;

  @Field(() => String)
  public accessToken: string;
}
