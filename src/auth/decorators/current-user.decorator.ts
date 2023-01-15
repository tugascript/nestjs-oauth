/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): number | undefined => {
    return context.switchToHttp().getRequest()?.user;
  },
);
