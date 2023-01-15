/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IsString, MinLength } from 'class-validator';

export abstract class PasswordDto {
  @IsString()
  @MinLength(1)
  public password: string;
}
