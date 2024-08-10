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
