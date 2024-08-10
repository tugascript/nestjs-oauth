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
import { IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/consts/regex.const';

export abstract class PasswordsDto {
  @ApiProperty({
    description: 'New password',
    minLength: 8,
    maxLength: 35,
    type: String,
  })
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol',
  })
  public password1!: string;

  @ApiProperty({
    description: 'Password confirmation',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(1)
  public password2!: string;
}
