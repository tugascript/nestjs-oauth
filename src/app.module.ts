/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { config } from './config';
import { CacheConfig } from './config/cache.config';
import { validationSchema } from './config/config.schema';
import { MikroOrmConfig } from './config/mikroorm.config';
import { JwtModule } from './jwt/jwt.module';
import { MailerModule } from './mailer/mailer.module';
import { UsersModule } from './users/users.module';

@Module({
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
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheConfig,
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    JwtModule,
    MailerModule,
  ],
  providers: [AppService],
})
export class AppModule {}
