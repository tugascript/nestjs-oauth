/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { faker } from '@faker-js/faker';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { compare } from 'bcrypt';
import { CommonModule } from '../../common/common.module';
import { CommonService } from '../../common/common.service';
import { config } from '../../config';
import { validationSchema } from '../../config/config.schema';
import { MikroOrmConfig } from '../../config/mikroorm.config';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let module: TestingModule,
    service: UsersService,
    commonService: CommonService,
    orm: MikroORM;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          load: [config],
        }),
        CacheModule.register({
          isGlobal: true,
          ttl: parseInt(process.env.JWT_REFRESH_TIME, 10),
        }),
        MikroOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: MikroOrmConfig,
        }),
        MikroOrmModule.forFeature([UserEntity]),
        CommonModule,
      ],
      providers: [UsersService, CommonModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
    commonService = module.get<CommonService>(CommonService);
    orm = module.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().createSchema();
  });

  const email = faker.internet.email();
  const email2 = faker.internet.email();
  const name = faker.name.firstName();
  const password = faker.internet.password(8);

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(service).toBeDefined();
    expect(commonService).toBeDefined();
    expect(orm).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = await service.create(email, name, password);
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.username).toEqual(commonService.generatePointSlug(name));
    });

    it('should throw a conflict exception', async () => {
      await expect(
        service.create(
          email,
          faker.name.firstName(),
          faker.internet.password(8),
        ),
      ).rejects.toThrowError('Email already in use');
    });

    it('should create a user with a different username', async () => {
      const user = await service.create(
        email2,
        name,
        faker.internet.password(8),
      );
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.username).toEqual(
        commonService.generatePointSlug(name) + '1',
      );
    });
  });

  describe('read', () => {
    describe('by id', () => {
      it('should find a user by id', async () => {
        const user = await service.findOneById(1);
        expect(user).toBeInstanceOf(UserEntity);
      });

      it('should throw a not found exception', async () => {
        await expect(service.findOneById(3)).rejects.toThrowError(
          'User not found',
        );
      });
    });

    describe('by username', () => {
      it('should find a user by username', async () => {
        const user = await service.findOneByUsername(
          commonService.generatePointSlug(name),
        );
        expect(user).toBeInstanceOf(UserEntity);
      });

      it('should throw a not found exception', async () => {
        await expect(
          service.findOneByUsername('not-found'),
        ).rejects.toThrowError('User not found');
      });

      it('should throw an unauthorized exception', async () => {
        await expect(
          service.findOneByUsername('not-found', true),
        ).rejects.toThrowError('Invalid credentials');
      });
    });

    describe('by email', () => {
      it('should find a user by email', async () => {
        const user = await service.findOneByEmail(email);
        expect(user).toBeInstanceOf(UserEntity);
      });

      it('should throw an unauthorized exception', async () => {
        await expect(service.findOneByEmail('not-found')).rejects.toThrowError(
          'Invalid credentials',
        );
      });

      it('should return null if not found', async () => {
        const user = await service.uncheckedUserByEmail('not-found');
        expect(user).toBeNull();
      });
    });

    describe('by credentials', () => {
      it('should find a user by credentials', async () => {
        const user = await service.findOneByCredentials(1, 0);
        expect(user).toBeInstanceOf(UserEntity);
      });

      it('should throw an unauthorized exception', async () => {
        await expect(service.findOneByCredentials(1, 1)).rejects.toThrowError(
          'Invalid credentials',
        );
      });
    });
  });

  describe('update', () => {
    describe('username', () => {
      it('should update a user username', async () => {
        const user = await service.update(1, {
          username: 'new-username',
        });
        expect(user).toBeInstanceOf(UserEntity);
        expect(user.username).toEqual('new-username');
      });

      it('should throw a conflict exception', async () => {
        await expect(
          service.update(2, { username: 'new-username' }),
        ).rejects.toThrowError('Username already in use');
      });
    });

    describe('email', () => {
      it('should throw a bad request exception if password is wrong', async () => {
        await expect(
          service.updateEmail(1, {
            email: faker.internet.email(),
            password: password + '1',
          }),
        ).rejects.toThrowError('Wrong password');
      });

      it('should update a user email', async () => {
        const newEmail = faker.internet.email();
        const user = await service.updateEmail(1, {
          email: newEmail,
          password,
        });
        expect(user).toBeInstanceOf(UserEntity);
        expect(user.email).toEqual(newEmail.toLowerCase());
      });

      it('should throw a conflict exception', async () => {
        await expect(
          service.updateEmail(1, { email: email2, password }),
        ).rejects.toThrowError('Email already in use');
      });
    });

    describe('password', () => {
      const newPassword = faker.internet.password(8);

      it('should update a user password', async () => {
        const user = await service.updatePassword(1, password, newPassword);
        expect(user).toBeInstanceOf(UserEntity);
        expect(await compare(newPassword, user.password)).toBe(true);
        expect(user.credentials.version).toStrictEqual(1);
      });

      it('should throw a bad request exception if the new password is the same', async () => {
        await expect(
          service.updatePassword(1, newPassword, newPassword),
        ).rejects.toThrowError('New password must be different');
      });

      it('should throw a bad request exception if the password is wrong', async () => {
        await expect(
          service.updatePassword(
            1,
            'wrong-password',
            faker.internet.password(8),
          ),
        ).rejects.toThrowError('Wrong password');
      });

      it('should reset a user password', async () => {
        const user = await service.resetPassword(1, 1, password);
        expect(user).toBeInstanceOf(UserEntity);
        expect(await compare(password, user.password)).toBe(true);
        expect(user.credentials.version).toStrictEqual(2);
      });

      it('should throw an unauthorized exception', async () => {
        await expect(
          service.resetPassword(1, 0, faker.internet.password(8)),
        ).rejects.toThrowError('Invalid credentials');
      });
    });
  });

  describe('delete', () => {
    it('should thow an error if password is wrong', async () => {
      await expect(
        service.delete(1, { password: password + '1' }),
      ).rejects.toThrowError('Wrong password');
    });

    it('should delete a user', async () => {
      await service.delete(1, { password });
      await expect(service.findOneById(1)).rejects.toThrowError(
        'User not found',
      );
    });
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close(true);
    await module.close();
  });
});
