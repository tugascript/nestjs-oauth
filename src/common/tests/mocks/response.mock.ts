/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { FastifyReply } from 'fastify';

class ResponseMock {
  public cookie = jest.fn().mockReturnThis();
  public clearCookie = jest.fn().mockReturnThis();
  public status = jest.fn().mockReturnThis();
  public header = jest.fn().mockReturnThis();
  public send = jest.fn().mockReturnThis();
}

export const createResponseMock = (): FastifyReply =>
  new ResponseMock() as unknown as FastifyReply;
