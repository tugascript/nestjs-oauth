/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Request, Response } from 'express-serve-static-core';

export interface IContext {
  req: Request;
  res: Response;
}
