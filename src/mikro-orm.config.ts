/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { LoadStrategy, Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';

const config: Options = defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: ['dist/**/*.entities.js', 'dist/**/*.embeddables.js'],
  entitiesTs: ['src/**/*.entities.ts', 'src/**/*.embeddables.ts'],
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: true,
});

export default config;
