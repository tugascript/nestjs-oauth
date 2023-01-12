/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { IEmailConfig } from './email-config.interface';
import { IJwt } from './jwt.interface';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  db: MikroOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
}
