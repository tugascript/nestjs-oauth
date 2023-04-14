/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

export interface IProvider {
  readonly tokenHost: string;
  readonly tokenPath: string;
  readonly authorizeHost: string;
  readonly authorizePath: string;
  readonly refreshPath?: string;
  readonly revokePath?: string;
}
