/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
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
