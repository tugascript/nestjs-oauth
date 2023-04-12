/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Test, TestingModule } from '@nestjs/testing';
import { Oauth2Service } from '../oauth2.service';

describe('Oauth2Service', () => {
  let module: TestingModule,
    service: Oauth2Service,

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Oauth2Service],
    }).compile();

    service = module.get<Oauth2Service>(Oauth2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
