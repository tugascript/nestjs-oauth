/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { ApiProperty } from '@nestjs/swagger';
import { v4 } from 'uuid';
import { IMessage } from '../interfaces/message.interface';

export class MessageMapper implements IMessage {
  @ApiProperty({
    description: 'Message UUID',
    example: 'c0a80121-7ac0-11d1-898c-00c04fd8d5cd',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Message',
    example: 'Hello World',
    type: String,
  })
  public message: string;

  constructor(message: string) {
    this.id = v4();
    this.message = message;
  }
}
