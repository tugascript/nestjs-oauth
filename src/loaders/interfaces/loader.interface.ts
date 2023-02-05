/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Dictionary } from '@mikro-orm/core';

export interface ILoader<T extends Dictionary, P = undefined> {
  obj: T;
  params: P;
}
