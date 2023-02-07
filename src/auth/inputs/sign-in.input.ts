/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, MinLength } from 'class-validator';

@InputType('SignUpInput')
export abstract class SignInInput {
  @Field(() => String)
  @IsString()
  @Length(3, 255)
  public emailOrUsername!: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  public password!: string;
}
