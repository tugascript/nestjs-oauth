/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  Entity,
  ManyToOne,
  PrimaryKeyType,
  Property,
  Unique,
} from '@mikro-orm/core';
import { UserEntity } from '../../users/entities/user.entity';
import { IBlacklistedToken } from '../interfaces/blacklisted-token.interface';

@Entity({ tableName: 'blacklisted_tokens' })
@Unique({ properties: ['tokenId', 'user'] })
export class BlacklistedTokenEntity implements IBlacklistedToken {
  @Property({
    primary: true,
    columnType: 'uuid',
  })
  public tokenId: string;

  @ManyToOne({
    entity: () => UserEntity,
    onDelete: 'cascade',
    primary: true,
  })
  public user: UserEntity;

  @Property({ onCreate: () => new Date() })
  public createdAt: Date;

  [PrimaryKeyType]: [string, number];
}
