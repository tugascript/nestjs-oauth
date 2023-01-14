/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { faker } from '@faker-js/faker';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from '../../config';
import { validationSchema } from '../../config/config.schema';
import { IUser } from '../../users/interfaces/user.interface';
import { MailerService } from '../mailer.service';

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          load: [config],
        }),
      ],
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
    jest
      .spyOn(service, 'sendEmail')
      .mockImplementation((_, __, html: string, log?: string) => {
        console.log('html', html);
        if (log) {
          console.log(log);
        }
      });
  });

  const user = {
    id: 1,
    email: faker.internet.email().toLowerCase(),
    credentials: {
      version: 2,
    },
  } as IUser;

  describe('sendEmail', () => {
    it('send confirmation email', async () => {
      service.sendConfirmationEmail(user, 'token');
      expect(service.sendEmail).toHaveBeenCalled();
    });

    it('send reset password email', async () => {
      service.sendResetPasswordEmail(user, 'token');
      expect(service.sendEmail).toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
