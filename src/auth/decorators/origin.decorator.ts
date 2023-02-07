/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express-serve-static-core';
import { IContext } from '../../config/interfaces/context.interface';

export const Origin = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest<Request>().headers?.origin;
    }

    return GqlExecutionContext.create(context).getContext<IContext>().req
      .headers?.origin;
  },
);
