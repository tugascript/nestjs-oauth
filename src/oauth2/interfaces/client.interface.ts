/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

export interface IClient {
  readonly id: string;
  readonly secret: string;
  readonly secretParamName?: string | undefined;
  readonly idParamName?: string | undefined;
}
