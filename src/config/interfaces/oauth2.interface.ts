/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IClient } from '../../oauth2/interfaces/client.interface';

export interface IOAuth2 {
  readonly microsoft: IClient | null;
  readonly google: IClient | null;
  readonly facebook: IClient | null;
  readonly github: IClient | null;
}
