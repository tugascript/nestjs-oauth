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
import { IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NAME_REGEX, SLUG_REGEX } from '../../common/consts/regex.const';
import { isNull, isUndefined } from '../../common/utils/validation.util';

export abstract class UpdateUserDto {
  @ApiProperty({
    description: 'The new username',
    example: 'new-username',
    type: String,
  })
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @ValidateIf(
    (o: UpdateUserDto) =>
      !isUndefined(o.username) || isUndefined(o.name) || isNull(o.name),
  )
  public username?: string;

  @ApiProperty({
    description: 'The new name',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  @ValidateIf(
    (o: UpdateUserDto) =>
      !isUndefined(o.name) || isUndefined(o.username) || isNull(o.username),
  )
  public name?: string;
}
