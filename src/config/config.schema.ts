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

import Joi from 'joi';

export const validationSchema = Joi.object({
  APP_ID: Joi.string().uuid({ version: 'uuidv4' }).required(),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().required(),
  DOMAIN: Joi.string().domain().required(),
  URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_ACCESS_TIME: Joi.number().required(),
  JWT_CONFIRMATION_SECRET: Joi.string().required(),
  JWT_CONFIRMATION_TIME: Joi.number().required(),
  JWT_RESET_PASSWORD_SECRET: Joi.string().required(),
  JWT_RESET_PASSWORD_TIME: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_TIME: Joi.number().required(),
  REFRESH_COOKIE: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_SECURE: Joi.bool().required(),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  THROTTLE_TTL: Joi.number().required(),
  THROTTLE_LIMIT: Joi.number().required(),
  MICROSOFT_CLIENT_ID: Joi.string().optional(),
  MICROSOFT_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  FACEBOOK_CLIENT_ID: Joi.string().optional(),
  FACEBOOK_CLIENT_SECRET: Joi.string().optional(),
  GITHUB_CLIENT_ID: Joi.string().optional(),
  GITHUB_CLIENT_SECRET: Joi.string().optional(),
});
