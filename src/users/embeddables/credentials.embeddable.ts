/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Embeddable, Property } from '@mikro-orm/core';
import dayjs from 'dayjs';
import { ICredentials } from '../interfaces/credentials.interface';

@Embeddable()
export class CredentialsEmbeddable implements ICredentials {
  @Property({ default: 0 })
  public version = 0;

  @Property({ default: '' })
  public lastPassword = '';

  @Property({ default: dayjs().unix() })
  public passwordUpdatedAt: number = dayjs().unix();

  @Property({ default: dayjs().unix() })
  public updatedAt: number = dayjs().unix();

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    this.passwordUpdatedAt = dayjs().unix();
    this.updatedAt = dayjs().unix();
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}
