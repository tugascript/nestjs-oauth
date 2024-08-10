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

import { FastifyRequest } from 'fastify';

class RequestMock {
  public cookies: Record<string, string> = {};
  public headers: Record<string, Record<string, string>> = {};

  public setCookie(name: string, value: string): void {
    this.cookies[name] = value;
  }

  public removeCookie(name: string): void {
    delete this.cookies[name];
  }

  public unsignCookie(cookie: string): { value: string; valid: boolean } {
    const value = Object.values(this.cookies).find((c) => c === cookie);
    return { value, valid: true };
  }
}

interface ExtendedRequestMock extends FastifyRequest {
  setCookie: (name: string, value: string) => void;
  removeCookie: (name: string) => void;
}

export const createRequestMock = (): ExtendedRequestMock =>
  new RequestMock() as unknown as ExtendedRequestMock;
