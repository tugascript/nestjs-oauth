/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export abstract class SignInDto {
  @ApiProperty({
    description: 'Username or email',
    examples: ['john.doe', 'john.doe@gmail.com'],
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @Length(3, 255)
  public emailOrUsername: string;

  @ApiProperty({
    description: "User's password",
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password: string;
}
