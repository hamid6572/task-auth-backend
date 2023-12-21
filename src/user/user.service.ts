import { Injectable } from '@nestjs/common';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

import { CommonService } from '../common/common.service.js';
import { JwtAuthService } from './jwt-auth.service.js';
import { LoginInput } from './dto/input/auth-input.js';
import { UserRepository } from './user.repository.js';
import { UserInput } from './dto/input/user-input.js';
import { User, UserBuilder } from './entities/user.entity.js';
import { LoginResponse } from './dto/output/auth-response.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Users user service
   * @param email
   * @returns user
   */
  async user(email: any): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      relations: { posts: true, comments: true },
    });
  }

  /**
   * Validates password
   * @param Password
   * @param dbPassword
   * @returns true if password
   */
  validatePassword(Password: string, dbPassword: string): boolean {
    const isValidPassword =
      Password && this.commonService.comparePassword(Password, dbPassword);
    if (!isValidPassword) throw new BadRequestException('Invalid password!');

    return true;
  }

  /**
   * Validates user
   * @param email
   * @param password
   */
  async validateUser(email: string, password: string) {
    const user = await this.user(email);
    if (!user)
      throw new UnauthorizedException(
        'Invalid username or user may not exist!',
      );

    const isValidPassword = this.validatePassword(password, user?.password);
    if (isValidPassword) return user;

    throw new UnauthorizedException('Invalid username or password');
  }

  /**
   * Creates user
   * @param userData
   * @returns user
   */
  async createUser({
    firstName,
    lastName,
    email,
    password,
  }: UserInput): Promise<LoginResponse> {
    if (await this.user(email)) throw new Error('User already exists!');

    const user = new UserBuilder()
      .setFirstName(firstName)
      .setLastName(lastName)
      .setEmail(email)
      .setPassword(password)
      .build();
    const newUser = await this.userRepository.save(user);
    if (!newUser) throw new Error("There's some issue creating user!");

    const token = await this.jwtAuthService.getJwtToken({
      id: user.id,
      firstName: user.firstName,
    });
    return { token: `Bearer ${token}`, user };
  }

  /**
   * Logins user
   * @param loginData
   * @returns user
   */
  async loginUser(loginData: LoginInput): Promise<LoginResponse> {
    const user = await this.user(loginData.email);
    if (!user) throw new Error('No user Exists!');

    const token = await this.jwtAuthService.getJwtToken({
      id: user.id,
      firstName: user.firstName,
    });

    return { token: `Bearer ${token}`, user };
  }
}
