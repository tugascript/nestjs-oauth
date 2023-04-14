/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
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
