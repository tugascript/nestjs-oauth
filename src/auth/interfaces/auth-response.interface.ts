/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IAuthResUser } from './auth-response-user.interface';

export interface IAuthResponse {
  user: IAuthResUser;
  accessToken: string;
}
