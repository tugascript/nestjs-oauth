/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { RedisOptions } from 'ioredis';

export const redisUrlParser = (url: string): RedisOptions => {
  if (url.includes('://:')) {
    const arr = url.split('://:')[1].split('@');
    const secondArr = arr[1].split(':');

    return {
      password: arr[0],
      host: secondArr[0],
      port: parseInt(secondArr[1], 10),
    };
  }

  const connectionString = url.split('://')[1];
  const arr = connectionString.split(':');
  return {
    host: arr[0],
    port: parseInt(arr[1], 10),
  };
};
