/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { v4 } from 'uuid';
import { IMessage } from '../../interfaces/message.interface';

@ObjectType('Message')
export class MessageType implements IMessage {
  @Field(() => String)
  public id: string;

  @Field(() => String)
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
