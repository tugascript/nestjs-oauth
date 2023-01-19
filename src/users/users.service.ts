/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { isInt } from 'class-validator';
import { CommonService } from '../common/common.service';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { PasswordDto } from './dtos/password.dto';
import { UsernameDto } from './dtos/username.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
    private readonly commonService: CommonService,
  ) {}

  public async create(
    email: string,
    name: string,
    password: string,
  ): Promise<UserEntity> {
    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    const formattedName = this.commonService.formatName(name);
    const user = this.usersRepository.create({
      email: formattedEmail,
      name: formattedName,
      username: await this.generateUsername(formattedName),
      password: await hash(password, 10),
    });
    await this.commonService.saveEntity(this.usersRepository, user, true);
    return user;
  }

  public async findOneByIdOrUsername(
    idOrUsername: string,
  ): Promise<UserEntity> {
    const parsedValue = parseInt(idOrUsername, 10);

    if (!isNaN(parsedValue) && parsedValue > 0 && isInt(parsedValue)) {
      return this.findOneById(parsedValue);
    }

    if (
      idOrUsername.length < 3 ||
      idOrUsername.length > 106 ||
      !SLUG_REGEX.test(idOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.findOneByUsername(idOrUsername);
  }

  public async findOneById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ id });
    this.commonService.checkEntityExistence(user, 'User');
    return user;
  }

  public async findOneByUsername(
    username: string,
    forAuth = false,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      username: username.toLowerCase(),
    });

    if (forAuth) {
      this.throwUnauthorizedException(user);
    } else {
      this.commonService.checkEntityExistence(user, 'User');
    }

    return user;
  }

  public async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      email: email.toLowerCase(),
    });
    this.throwUnauthorizedException(user);
    return user;
  }

  // necessary for password reset
  public async uncheckedUserByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findOne({
      email: email.toLowerCase(),
    });
  }

  public async findOneByCredentials(
    id: number,
    version: number,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ id });
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async confirmEmail(
    userId: number,
    version: number,
  ): Promise<UserEntity> {
    const user = await this.findOneByCredentials(userId, version);

    if (user.confirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    user.confirmed = true;
    user.credentials.updateVersion();
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async updateUsername(
    userId: number,
    dto: UsernameDto,
  ): Promise<UserEntity> {
    const user = await this.findOneById(userId);
    const formattedUsername = dto.username.toLowerCase();

    if (user.username === formattedUsername) {
      throw new BadRequestException('Username should be different');
    }

    await this.checkUsernameUniqueness(formattedUsername);
    user.username = formattedUsername;
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async updatePassword(
    userId: number,
    password: string,
    newPassword: string,
  ): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }
    if (await compare(newPassword, user.password)) {
      throw new BadRequestException('New password must be different');
    }

    user.credentials.updatePassword(user.password);
    user.password = await hash(newPassword, 10);
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async resetPassword(
    userId: number,
    version: number,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.findOneByCredentials(userId, version);
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, 10);
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async updateEmail(
    userId: number,
    dto: ChangeEmailDto,
  ): Promise<UserEntity> {
    const user = await this.findOneById(userId);
    const { email, password } = dto;

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    const formattedEmail = email.toLowerCase();

    if (user.email === formattedEmail) {
      throw new BadRequestException('Email should be different');
    }

    await this.checkEmailUniqueness(formattedEmail);
    user.email = formattedEmail;
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async delete(userId: number, dto: PasswordDto): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    if (!(await compare(dto.password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    await this.commonService.removeEntity(this.usersRepository, user);
    return user;
  }

  private async checkUsernameUniqueness(username: string): Promise<void> {
    const count = await this.usersRepository.count({ username });

    if (count > 0) {
      throw new ConflictException('Username already in use');
    }
  }

  private throwUnauthorizedException(
    user: undefined | null | UserEntity,
  ): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async checkEmailUniqueness(email: string): Promise<void> {
    const count = await this.usersRepository.count({ email });

    if (count > 0) {
      throw new ConflictException('Email already in use');
    }
  }

  /**
   * Generate Username
   *
   * Generates a unique username using a point slug based on the name
   * and if it's already in use, it adds the usernames count to the end
   */
  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this.usersRepository.count({
      username: {
        $like: `${pointSlug}%`,
      },
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }
}
