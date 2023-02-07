/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, InputType } from '@nestjs/graphql';
import { IsJWT, IsString } from 'class-validator';
import { PasswordsDto } from '../dtos/passwords.dto';

@InputType('ResetPasswordInput')
export abstract class ResetPasswordInput extends PasswordsDto {
  @Field(() => String)
  @IsString()
  @IsJWT()
  public resetToken!: string;
}
