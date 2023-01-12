/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IsString, Length, Matches } from 'class-validator';
import { SLUG_REGEX } from '../../common/consts/regex.const';

export abstract class UsernameDto {
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  public username: string;
}
