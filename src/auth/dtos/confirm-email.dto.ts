/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IsJWT, IsString } from 'class-validator';

export abstract class ConfirmEmailDto {
  @IsString()
  @IsJWT()
  public confirmationToken!: string;
}
