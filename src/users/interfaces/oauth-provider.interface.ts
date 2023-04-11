/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IUser } from './user.interface';

export interface IOAuthProvider {
  readonly provider: string;
  readonly user: IUser;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
