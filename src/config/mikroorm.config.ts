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

import {
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MikroOrmConfig implements MikroOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  public createMikroOrmOptions(): MikroOrmModuleOptions {
    return this.configService.get<MikroOrmModuleOptions>('db');
  }
}
