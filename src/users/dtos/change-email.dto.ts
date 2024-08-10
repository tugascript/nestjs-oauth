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
import { IsEmail, IsString, Length } from 'class-validator';
import { PasswordDto } from './password.dto';

export abstract class ChangeEmailDto extends PasswordDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'someone@gmail.com',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;
}
