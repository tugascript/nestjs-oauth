/*
 Copyright (C) 2024 Afonso Barracha

 Nest OAuth is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Nest OAuth is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with Nest OAuth.  If not, see <https://www.gnu.org/licenses/>.
*/

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class TokenDto {
  @ApiProperty({
    description: 'The Code to exchange for a token',
    example: '5WA0R4DVyWThKFnc73z7nT',
    minLength: 1,
    maxLength: 22,
    type: String,
  })
  @IsString()
  @Length(1, 22)
  public code: string;

  @ApiProperty({
    description: 'The hex state for exchanging the token',
    example: 'cb85f0214feefbff8c7923cb9790a3f2',
    minLength: 1,
    maxLength: 35,
    type: String,
  })
  @IsString()
  @Length(1, 32)
  public state: string;
}
