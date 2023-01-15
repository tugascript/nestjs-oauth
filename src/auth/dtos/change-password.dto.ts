/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { PasswordsDto } from './passwords.dto';

export abstract class ChangePasswordDto extends PasswordsDto {
  @ApiProperty({
    description: 'The current password',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password!: string;
}
