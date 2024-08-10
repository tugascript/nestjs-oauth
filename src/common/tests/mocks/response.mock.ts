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
