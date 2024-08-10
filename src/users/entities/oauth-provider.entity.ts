/*
 Copyright (C) 2024 Afonso Barracha

 Nest OAuth is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Nest OAuth is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with Nest OAuth.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKeyProp,
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
    deleteRule: 'cascade',
  })
  public user: UserEntity;

  @Property({ onCreate: () => new Date() })
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  [PrimaryKeyProp]?: [OAuthProvidersEnum, number];
}
