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

export interface ISingleJwt {
  secret: string;
  time: number;
}

export interface IAccessJwt {
  publicKey: string;
  privateKey: string;
  time: number;
}

export interface IJwt {
  access: IAccessJwt;
  confirmation: ISingleJwt;
  resetPassword: ISingleJwt;
  refresh: ISingleJwt;
}
