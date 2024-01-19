import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GqlAuthGuard } from './guards/gql-auth.guard.js';
import { LoginInput } from './dto/input/auth-input.js';
import { LoginResponse } from './dto/output/auth-response.js';
import { UserInput } from './dto/input/user-input.js';
import { User } from './entities/user.entity.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async user(@CurrentUser() user: User) {
    return this.userService.getUserById(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LoginResponse)
  async login(@Args('loginData') loginData: LoginInput) {
    return await this.userService.loginUser(loginData);
  }

  @Mutation(() => LoginResponse)
  async register(@Args('createUser') createUser: UserInput) {
    return await this.userService.createUser(createUser);
  }

  // @ResolveField(() => [Post])
  // async posts(@Parent() user: User) {
  //   return this.postService.postsByUserId(user.id);
  // }
}
