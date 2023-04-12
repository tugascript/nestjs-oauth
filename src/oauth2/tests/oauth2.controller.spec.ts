/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Test, TestingModule } from '@nestjs/testing';
import { Oauth2Controller } from '../oauth2.controller';
import { Oauth2Service } from '../oauth2.service';

describe('Oauth2Controller', () => {
  let controller: Oauth2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Oauth2Controller],
      providers: [Oauth2Service],
    }).compile();

    controller = module.get<Oauth2Controller>(Oauth2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
