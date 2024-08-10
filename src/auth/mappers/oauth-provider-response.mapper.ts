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

import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvidersEnum } from '../../users/enums/oauth-providers.enum';
import { IOAuthProvider } from '../../users/interfaces/oauth-provider.interface';
import {
  IOAuthProviderResponse,
  IOAuthProvidersResponse,
} from '../interfaces/oauth-provider-response.interface';

export class OAuthProviderResponseMapper implements IOAuthProviderResponse {
  @ApiProperty({
    description: 'OAuth provider name',
    example: OAuthProvidersEnum.MICROSOFT,
    enum: OAuthProvidersEnum,
  })
  public readonly provider: OAuthProvidersEnum;

  @ApiProperty({
    description: 'OAuth provider creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public readonly createdAt: string;

  @ApiProperty({
    description: 'OAuth provider last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public readonly updatedAt: string;

  constructor(values: IOAuthProviderResponse) {
    Object.assign(this, values);
  }

  public static map(provider: IOAuthProvider): OAuthProviderResponseMapper {
    return new OAuthProviderResponseMapper({
      provider: provider.provider,
      createdAt: provider.createdAt.toISOString(),
      updatedAt: provider.updatedAt.toISOString(),
    });
  }
}

export class OAuthProvidersResponseMapper implements IOAuthProvidersResponse {
  @ApiProperty({
    description: 'OAuth providers',
    example: [
      {
        provider: OAuthProvidersEnum.MICROSOFT,
        createdAt: '2021-01-01T00:00:00.000Z',
        updatedAt: '2021-01-01T00:00:00.000Z',
      },
    ],
    type: [OAuthProviderResponseMapper],
  })
  public readonly data: OAuthProviderResponseMapper[];

  constructor(values: IOAuthProvidersResponse) {
    Object.assign(this, values);
  }

  public static map(providers: IOAuthProvider[]): OAuthProvidersResponseMapper {
    return new OAuthProvidersResponseMapper({
      data: providers.map((provider) =>
        OAuthProviderResponseMapper.map(provider),
      ),
    });
  }
}
