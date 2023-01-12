/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IUser } from '../../users/interfaces/user.interface';

export interface IBlacklistedToken {
  tokenId: string;
  user: IUser;
  createdAt: Date;
}
