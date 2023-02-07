/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { PasswordsDto } from '../dtos/passwords.dto';

@InputType('UpdatePasswordInput')
export abstract class UpdatePasswordInput extends PasswordsDto {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  public password!: string;
}
