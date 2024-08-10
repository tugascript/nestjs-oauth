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

import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '../common.service';
import { EntityMock } from './mocks/entity.mock';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmConfig } from '../../config/mikroorm.config';
import { validationSchema } from '../../config/config.schema';
import { config } from '../../config';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          load: [config],
        }),
        MikroOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: MikroOrmConfig,
        }),
      ],
      providers: [CommonService],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  describe('entity validation', () => {
    it('should throw a BadRequestException with one error', () => {
      const invalidEntity = new EntityMock('a!_a9{');
      expect(service.validateEntity(invalidEntity)).rejects.toThrowError(
        'name must not have special characters',
      );
    });

    it('should throw a BadRequestException with multiple', () => {
      const invalidEntity = new EntityMock('a!');
      invalidEntity.id = 'invalid id';
      expect(service.validateEntity(invalidEntity)).rejects.toThrowError(
        'id must be a UUID,\nname must not have special characters,\nname must be longer than or equal to 3 characters',
      );
    });

    it('should not throw a BadRequestException', () => {
      const validEntity = new EntityMock('Valid Name');
      expect(service.validateEntity(validEntity)).resolves.toBeUndefined();
    });
  });

  describe('error wrappers', () => {
    const mockPromise = (code: string) => {
      return new Promise((_, reject) => {
        const err = new Error('mock error') as unknown as Record<
          string,
          string
        >;
        err.code = code;
        reject(err);
      });
    };

    it('should throw a ConflictException if code is correct', async () => {
      await expect(
        service.throwDuplicateError(mockPromise('23505')),
      ).rejects.toThrowError('Duplicated value in database');
      await expect(
        service.throwDuplicateError(mockPromise('23514')),
      ).rejects.toThrowError('mock error');
    });

    it('should throw a InternalServerErrorException', async () => {
      await expect(
        service.throwInternalError(mockPromise('23514')),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('entity actions', () => {
    const entity = new EntityMock('Valid Name');

    it('check entity existence', () => {
      expect(() =>
        service.checkEntityExistence(entity, 'Entity'),
      ).not.toThrow();
      expect(() => service.checkEntityExistence(null, 'Entity')).toThrowError(
        'Entity not found',
      );
      expect(() =>
        service.checkEntityExistence(undefined, 'Entity'),
      ).toThrowError('Entity not found');
    });
  });

  describe('string manipulation', () => {
    it('should format names', () => {
      expect(service.formatName('hello whole world')).toBe('Hello Whole World');
      expect(service.formatName('\nvery\nbad     \n\n\n\n\n\n\n\n')).toBe(
        'Very Bad',
      );
      expect(
        service.formatName(
          '              Loads             of                 Spaces                   \n',
        ),
      ).toBe('Loads Of Spaces');
    });

    it('should generate a point slug', () => {
      expect(service.generatePointSlug("Sir' John Doe")).toBe('sir.john.doe');
      expect(service.generatePointSlug('Some-linked name')).toBe(
        'somelinked.name',
      );
      expect(service.generatePointSlug('Some_linked name')).toBe(
        'somelinked.name',
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
