/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export abstract class PasswordDto {
  @ApiProperty({
    description: 'The password of the user',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password: string;
}
