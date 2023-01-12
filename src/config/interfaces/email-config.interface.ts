/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

interface IEmailAuth {
  user: string;
  pass: string;
}

export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: IEmailAuth;
}
