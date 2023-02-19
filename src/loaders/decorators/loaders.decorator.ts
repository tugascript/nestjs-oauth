/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IContext } from '../../config/interfaces/context.interface';
import { ILoaders } from '../interfaces/loaders.interface';

export const Loaders = createParamDecorator(
  (_, context: ExecutionContext): ILoaders => {
    return GqlExecutionContext.create(context).getContext<IContext>().loaders;
  },
);
