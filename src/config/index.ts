/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { LoadStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', 'keys/public.key'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', 'keys/private.key'),
    'utf-8',
  );

  return {
    id: process.env.APP_ID,
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
    db: defineConfig({
      clientUrl: process.env.DATABASE_URL,
      entities: ['dist/**/*.entities.js', 'dist/**/*.embeddables.js'],
      entitiesTs: ['src/**/*.entities.ts', 'src/**/*.embeddables.ts'],
      loadStrategy: LoadStrategy.JOINED,
      allowGlobalContext: true,
    }),
  };
}
