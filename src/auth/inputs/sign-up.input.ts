/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { PasswordsDto } from '../dtos/passwords.dto';

@InputType('SignUpInput')
export abstract class SignUpInput extends PasswordsDto {
  @Field(() => String)
  @IsString()
  @Length(3, 100, {
    message: 'Name has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'Name can not contain special characters.',
  })
  public name!: string;

  @Field(() => String)
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;
}
