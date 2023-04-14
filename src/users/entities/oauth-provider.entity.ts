/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKeyType,
  Property,
  Unique,
} from '@mikro-orm/core';
import { IsEnum } from 'class-validator';
import { OAuthProvidersEnum } from '../enums/oauth-providers.enum';
import { IOAuthProvider } from '../interfaces/oauth-provider.interface';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'oauth_providers' })
@Unique({ properties: ['provider', 'user'] })
export class OAuthProviderEntity implements IOAuthProvider {
  @Enum({
    items: () => OAuthProvidersEnum,
    primary: true,
    columnType: 'varchar',
    length: 9,
  })
  @IsEnum(OAuthProvidersEnum)
  public provider: OAuthProvidersEnum;

  @ManyToOne({
    entity: () => UserEntity,
    inversedBy: (u) => u.oauthProviders,
    primary: true,
    onDelete: 'cascade',
  })
  public user: UserEntity;

  @Property({ onCreate: () => new Date() })
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  [PrimaryKeyType]?: [OAuthProvidersEnum, number];
}
