/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import DataLoader from 'dataloader';
import { IUser } from '../../users/interfaces/user.interface';
import { IFederatedInstance } from './federated-instance.interface';
import { ILoader } from './loader.interface';

export interface ILoaders {
  userLoader: DataLoader<
    ILoader<IFederatedInstance>,
    IUser,
    ILoader<IFederatedInstance>
  >;
}
