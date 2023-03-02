/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Global, Module } from '@nestjs/common';
import { LoadersService } from './loaders.service';

@Global()
@Module({
  providers: [LoadersService],
  exports: [LoadersService],
})
export class LoadersModule {}
