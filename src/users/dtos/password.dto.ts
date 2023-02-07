/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ArgsType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

@ArgsType()
export abstract class PasswordDto {
  @Field(() => String)
  @ApiProperty({
    description: 'The password of the user',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password: string;
}
