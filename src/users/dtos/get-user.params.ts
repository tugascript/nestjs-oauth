/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class GetUserParams {
  @ApiProperty({
    description: 'The id or username of the user',
    type: String,
    example: "1 or 'username'",
  })
  @IsString()
  @Length(1, 106)
  public idOrUsername: string;
}
