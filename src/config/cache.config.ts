/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisOptions } from 'ioredis';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const ttl = this.configService.get<number>('jwt.refresh.time');

    return this.configService.get<boolean>('testing')
      ? { ttl }
      : {
          store: await redisStore({
            ...this.configService.get<RedisOptions>('redis'),
            ttl,
          }),
        };
  }
}
