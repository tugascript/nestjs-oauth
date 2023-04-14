/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { OAuthProvidersEnum } from '../enums/oauth-providers.enum';
import { IUser } from './user.interface';

export interface IOAuthProvider {
  readonly provider: OAuthProvidersEnum;
  readonly user: IUser;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
