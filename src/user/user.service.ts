import { Injectable } from '@nestjs/common';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

import { CommonService } from '../common/common.service';
import { JwtAuthService } from './jwt-auth.service';
import { LoginInput } from './dto/input/auth-input';
import { UserRepository } from './user.repository';
import { UserInput } from './dto/input/user-input';
import { User } from './entities/user.entity';
import { LoginResponse } from './dto/output/auth-response';

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
  async createUser(userData: UserInput): Promise<LoginResponse> {
    if (await this.user(userData.email))
      throw new Error('User already exists!');
    const user = await this.userRepository.save({
      email: userData.email,
      password: this.commonService.encodePassword(userData.password),
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    if (!user) throw new Error("There's some issue creating user!");

    const token = await this.jwtAuthService.getJwtToken({
      id: user.id,
      email: user.email,
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
      email: user.email,
    });

    return { token: `Bearer ${token}`, user };
  }
}
