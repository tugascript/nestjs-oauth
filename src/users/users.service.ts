/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { QueryOrder } from '@mikro-orm/core';
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
import { UpdateUserDto } from './dtos/update-user.dto';
import { CredentialsEmbeddable } from './embeddables/credentials.embeddable';
import { OAuthProviderEntity } from './entities/oauth-provider.entity';
import { UserEntity } from './entities/user.entity';
import { OAuthProvidersEnum } from './enums/oauth-providers.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProvidersRepository: EntityRepository<OAuthProviderEntity>,
    private readonly commonService: CommonService,
  ) {}

  public async create(
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
    password?: string,
  ): Promise<UserEntity> {
    const isConfirmed = provider !== OAuthProvidersEnum.LOCAL;
    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    const formattedName = this.commonService.formatName(name);
    const user = this.usersRepository.create({
      email: formattedEmail,
      name: formattedName,
      username: await this.generateUsername(formattedName),
      password: isUndefined(password) ? 'UNSET' : await hash(password, 10),
      confirmed: isConfirmed,
      credentials: new CredentialsEmbeddable(isConfirmed),
    });
    await this.commonService.saveEntity(this.usersRepository, user, true);
    await this.createOAuthProvider(provider, user.id);
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

  public async update(userId: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOneById(userId);
    const { name, username } = dto;

    if (!isUndefined(name) && !isNull(name)) {
      if (name === user.name) {
        throw new BadRequestException('Name must be different');
      }

      user.name = this.commonService.formatName(name);
    }
    if (!isUndefined(username) && !isNull(username)) {
      const formattedUsername = dto.username.toLowerCase();

      if (user.username === formattedUsername) {
        throw new BadRequestException('Username should be different');
      }

      await this.checkUsernameUniqueness(formattedUsername);
      user.username = formattedUsername;
    }

    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async updatePassword(
    userId: number,
    newPassword: string,
    password?: string,
  ): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    if (user.password !== 'UNSET') {
      if (isUndefined(password) || isNull(password)) {
        throw new BadRequestException('Password is required');
      }
      if (!(await compare(password, user.password))) {
        throw new BadRequestException('Wrong password');
      }
    }
    if (await compare(newPassword, user.password)) {
      throw new BadRequestException('New password must be different');
    }
    if (user.password === 'UNSET') {
      await this.createOAuthProvider(OAuthProvidersEnum.LOCAL, user.id);
    }

    return await this.changePassword(user, newPassword);
  }

  public async resetPassword(
    userId: number,
    version: number,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.findOneByCredentials(userId, version);
    return await this.changePassword(user, password);
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

  public async findOrCreate(
    provider: OAuthProvidersEnum,
    email: string,
    name: string,
  ): Promise<UserEntity> {
    const formattedEmail = email.toLowerCase();
    const user = await this.usersRepository.findOne(
      {
        email: formattedEmail,
      },
      {
        populate: ['authProviders'],
      },
    );

    if (isUndefined(user) || isNull(user)) {
      return this.create(provider, email, name);
    }
    if (
      isUndefined(
        user.authProviders.getItems().find((p) => p.provider === provider),
      )
    ) {
      await this.createOAuthProvider(provider, user.id);
    }

    return user;
  }

  public async findOAuthProviders(
    userId: number,
  ): Promise<OAuthProviderEntity[]> {
    return await this.oauthProvidersRepository.find(
      {
        user: userId,
      },
      { orderBy: { provider: QueryOrder.ASC } },
    );
  }

  private async changePassword(
    user: UserEntity,
    password: string,
  ): Promise<UserEntity> {
    if (user.password === 'UNSET') {
      user.credentials.updateVersion();
    } else {
      user.credentials.updatePassword(user.password);
    }

    user.password = await hash(password, 10);
    await this.commonService.saveEntity(this.usersRepository, user);
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

  private async createOAuthProvider(
    provider: OAuthProvidersEnum,
    userId: number,
  ): Promise<OAuthProviderEntity> {
    const oauthProvider = this.oauthProvidersRepository.create({
      provider,
      user: userId,
    });
    await this.commonService.saveEntity(
      this.oauthProvidersRepository,
      oauthProvider,
      true,
    );
    return oauthProvider;
  }
}
