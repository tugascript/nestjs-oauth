/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { LoadStrategy } from '@mikro-orm/core';
import { defineConfig as definePGConfig } from '@mikro-orm/postgresql';
import { defineConfig as defineSqliteConfig } from '@mikro-orm/sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';
import { isUndefined } from '../common/utils/validation.util';
import { IConfig } from './interfaces/config.interface';
import { redisUrlParser } from './utils/redis-url-parser.util';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', 'keys/public.key'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', 'keys/private.key'),
    'utf-8',
  );
  const testing = process.env.NODE_ENV !== 'production';
  const dbOptions = {
    entities: ['dist/**/*.entity.js', 'dist/**/*.embeddable.js'],
    entitiesTs: ['src/**/*.entity.ts', 'src/**/*.embeddable.ts'],
    loadStrategy: LoadStrategy.JOINED,
    allowGlobalContext: true,
  };

  return {
    id: process.env.APP_ID,
    url: process.env.URL,
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN,
    jwt: {
      access: {
        privateKey,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
    },
    emailService: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    db: testing
      ? defineSqliteConfig({
          ...dbOptions,
          dbName: ':memory:',
        })
      : definePGConfig({
          ...dbOptions,
          clientUrl: process.env.DATABASE_URL,
        }),
    redis: redisUrlParser(process.env.REDIS_URL),
    throttler: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10),
      limit: parseInt(process.env.THROTTLE_LIMIT, 10),
    },
    testing,
    oauth2: {
      microsoft:
        isUndefined(process.env.MICROSOFT_CLIENT_ID) ||
        isUndefined(process.env.MICROSOFT_CLIENT_SECRET)
          ? null
          : {
              id: process.env.MICROSOFT_CLIENT_ID,
              secret: process.env.MICROSOFT_CLIENT_SECRET,
            },
      google:
        isUndefined(process.env.GOOGLE_CLIENT_ID) ||
        isUndefined(process.env.GOOGLE_CLIENT_SECRET)
          ? null
          : {
              id: process.env.GOOGLE_CLIENT_ID,
              secret: process.env.GOOGLE_CLIENT_SECRET,
            },
      facebook:
        isUndefined(process.env.FACEBOOK_CLIENT_ID) ||
        isUndefined(process.env.FACEBOOK_CLIENT_SECRET)
          ? null
          : {
              id: process.env.FACEBOOK_CLIENT_ID,
              secret: process.env.FACEBOOK_CLIENT_SECRET,
            },
      github:
        isUndefined(process.env.GITHUB_CLIENT_ID) ||
        isUndefined(process.env.GITHUB_CLIENT_SECRET)
          ? null
          : {
              id: process.env.GITHUB_CLIENT_ID,
              secret: process.env.GITHUB_CLIENT_SECRET,
            },
    },
  };
}
