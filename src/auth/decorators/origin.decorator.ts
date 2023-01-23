/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const Origin = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<FastifyRequest>().headers?.origin;
  },
);
