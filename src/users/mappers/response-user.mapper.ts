/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { IResponseUser } from '../interfaces/response-user.interface';
import { IUser } from '../interfaces/user.interface';

export class ResponseUserMapper implements IResponseUser {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'User username',
    example: 'john.doe1',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public username: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public updatedAt: string;

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
