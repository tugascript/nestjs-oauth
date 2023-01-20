/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Request as ExpressRequest } from 'express';

declare module 'express-serve-static-core' {
  interface Request extends ExpressRequest {
    user?: number;
  }
}
