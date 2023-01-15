/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return this.configService.get<boolean>('testing')
      ? this.configService.get<ThrottlerModuleOptions>('throttler')
      : {
          ...this.configService.get<ThrottlerModuleOptions>('throttler'),
          storage: new ThrottlerStorageRedisService(
            this.configService.get<RedisOptions>('redis'),
          ),
        };
  }
}
