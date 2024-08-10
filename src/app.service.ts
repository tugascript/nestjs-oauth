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

import { MikroORM } from '@mikro-orm/core';
import {
  Injectable,
  Logger,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly loggerService: LoggerService;
  private readonly testing: boolean;

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {
    this.loggerService = new Logger(AppService.name);
    this.testing = this.configService.get('testing');
  }

  public async onModuleInit() {
    if (this.testing) {
      this.loggerService.log('Started generating schema');
      await this.orm.getSchemaGenerator().createSchema();
      this.loggerService.log('Finished generating schema');
    }
  }

  public async onModuleDestroy() {
    if (this.testing) {
      this.loggerService.log('Started dropping schema');
      await this.orm.getSchemaGenerator().dropSchema();
      this.loggerService.log('Finished dropping schema');
    }

    this.loggerService.log('Closing database connection');
    await this.orm.close();
    this.loggerService.log('Closed database connection');
  }
}
