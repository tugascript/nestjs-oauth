/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { FastifyRequest as Request } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest extends Request {
    user?: number;
  }
}
