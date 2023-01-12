/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IsEmail, IsString, Length } from 'class-validator';

export abstract class EmailDto {
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;
}
