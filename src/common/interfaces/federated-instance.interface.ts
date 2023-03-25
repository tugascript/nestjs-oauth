/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

export interface IFederatedInstance<T extends string> {
  readonly __typename: T;
  readonly id: number;
}
