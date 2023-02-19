/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Request, Response } from 'express-serve-static-core';
import { ILoaders } from '../../loaders/interfaces/loaders.interface';

export interface IContext {
  req: Request;
  res: Response;
  loaders: ILoaders;
}
