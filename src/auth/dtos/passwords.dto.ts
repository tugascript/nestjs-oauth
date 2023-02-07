/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/consts/regex.const';

@InputType({ isAbstract: true })
@ArgsType()
export abstract class PasswordsDto {
  @Field(() => String)
  @ApiProperty({
    description: 'New password',
    minLength: 8,
    maxLength: 35,
    type: String,
  })
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol',
  })
  public password1!: string;

  @Field(() => String)
  @ApiProperty({
    description: 'Password confirmation',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password2!: string;
}
