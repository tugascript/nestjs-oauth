/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IAuthResponseUser } from './auth-response-user.interface';

export interface IAuthResponse {
  user: IAuthResponseUser;
  accessToken: string;
}
