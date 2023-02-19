/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { LoadersService } from '../loaders/loaders.service';
import { IContext } from './interfaces/context.interface';

export class GraphQLConfig implements GqlOptionsFactory {
  private readonly testing: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly loadersService: LoadersService,
  ) {
    this.testing = this.configService.get('testing');
  }

  public createGqlOptions(): ApolloDriverConfig {
    return {
      driver: ApolloDriver,
      context: ({ req, res }): IContext => ({
        req,
        res,
        loaders: this.loadersService.getLoaders(),
      }),
      path: '/api/graphql',
      autoSchemaFile: './schema.gql',
      debug: this.testing,
      sortSchema: true,
      bodyParserConfig: false,
      playground: this.testing,
      introspection: true,
    };
  }
}
