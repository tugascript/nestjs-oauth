/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express-serve-static-core';
import { IContext } from '../../config/interfaces/context.interface';

export const GqlRes = createParamDecorator(
  (_, context: ExecutionContext): Response => {
    return GqlExecutionContext.create(context).getContext<IContext>().res;
  },
);
