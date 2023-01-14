/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { EntityRepository } from '@mikro-orm/postgresql';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '../common.service';
import { EntityRepositoryMock } from './mocks/entity-repository.mock';
import { EntityMock } from './mocks/entity.mock';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    const repository =
      new EntityRepositoryMock() as unknown as EntityRepository<EntityMock>;
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

    it('save entity', async () => {
      await service.saveEntity(repository, entity);
      expect(repository.flush).toBeCalledTimes(1);

      await service.saveEntity(repository, entity, true);
      expect(repository.persist).toBeCalledTimes(1);
      expect(repository.flush).toBeCalledTimes(2);

      await expect(
        service.saveEntity(repository, new EntityMock('a!cc')),
      ).rejects.toThrowError('name must not have special characters');
    });

    it('remove entity', async () => {
      await service.removeEntity(repository, entity);
      expect(repository.removeAndFlush).toBeCalledTimes(1);
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
