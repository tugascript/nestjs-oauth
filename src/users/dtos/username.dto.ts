/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { SLUG_REGEX } from '../../common/consts/regex.const';

export abstract class UsernameDto {
  @ApiProperty({
    description: 'The username of the user',
    minLength: 3,
    maxLength: 106,
    example: 'my-username',
    type: String,
  })
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  public username: string;
}
