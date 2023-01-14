/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
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
