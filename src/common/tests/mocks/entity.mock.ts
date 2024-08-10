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

import { IsString, IsUUID, Length, Matches } from 'class-validator';
import { v4 } from 'uuid';
import { NAME_REGEX } from '../../consts/regex.const';

export class EntityMock {
  @IsString()
  @IsUUID(4)
  public id: string;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'name must not have special characters',
  })
  public name: string;

  constructor(name: string) {
    this.id = v4();
    this.name = name;
  }
}
