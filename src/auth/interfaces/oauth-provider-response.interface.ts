/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { OAuthProvidersEnum } from '../../users/enums/oauth-providers.enum';

export interface IOAuthProviderResponse {
  readonly provider: OAuthProvidersEnum;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IOAuthProvidersResponse {
  readonly data: IOAuthProviderResponse[];
}
