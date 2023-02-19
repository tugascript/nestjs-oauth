/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CommonService } from '../common/common.service';
import { UserEntity } from '../users/entities/user.entity';
import { IUser } from '../users/interfaces/user.interface';
import { IFederatedInstance } from './interfaces/federated-instance.interface';
import { ILoader } from './interfaces/loader.interface';
import { ILoaders } from './interfaces/loaders.interface';

@Injectable()
export class LoadersService {
  constructor(
    private readonly em: EntityManager,
    private readonly commonService: CommonService,
  ) {}

  public getLoaders(): ILoaders {
    return {
      userLoader: this.userLoader(),
    };
  }

  private userLoader() {
    return new DataLoader(
      async (data: ILoader<IFederatedInstance>[]): Promise<IUser[]> => {
        const ids = data.map((d) => d.obj.id);
        const users = await this.em.find(UserEntity, {
          id: {
            $in: ids,
          },
        });
        const map = new Map<number, IUser>(users.map((u) => [u.id, u]));
        return ids.map((id) => map.get(id));
      },
    );
  }
}
