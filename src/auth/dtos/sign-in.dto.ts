/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IsString, Length, MinLength } from 'class-validator';

export abstract class SignInDto {
  @IsString()
  @Length(3, 255)
  public emailOrUsername: string;

  @IsString()
  @MinLength(1)
  public password: string;
}
