/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Embeddable, Property } from '@mikro-orm/core';
import { ICredentials } from '../interfaces/credentials.interface';

@Embeddable()
export class CredentialsEmbeddable implements ICredentials {
  @Property({ default: 0 })
  public version = 0;

  @Property({ default: '' })
  public lastPassword = '';

  @Property({ default: Date.now() })
  public updatedAt: number = Date.now();

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    this.updatedAt = Date.now();
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = Date.now();
  }
}
