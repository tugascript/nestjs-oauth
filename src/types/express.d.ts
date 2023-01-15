/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

declare global {
  namespace Express {
    export interface Request {
      user?: number;
    }
  }
}
