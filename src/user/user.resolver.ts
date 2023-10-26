import { Resolver, Args, Query, Mutation, ResolveField, Parent } from "@nestjs/graphql";
import { Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { LoginInput } from "./dto/input/auth-input";
import { LoginResponse } from "./dto/output/auth-response";
import { UserInput } from "./dto/input/user-input";
import { User } from "./entities/user.entity";
import { PostService } from "../post/post.service";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    //private readonly postService: PostService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async user(@Args("email") email: string) {
    return this.userService.user(email);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LoginResponse)
  async login(@Args("loginData") loginData: LoginInput) {
    return  await this.userService.loginUser(loginData);    
  }

  @Mutation(() => LoginResponse)
  async register(@Args("createUser") createUser: UserInput) {
    return await this.userService.createUser(createUser);
  }

  // @ResolveField(() => [Post])
  // async posts(@Parent() user: User) {
  //   return this.postService.postsByUserId(user.id);
  // }
}
