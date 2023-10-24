import { Resolver, Args, Query, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { LoginInput } from "./dto/input/auth-input";
import { LoginResponse } from "./dto/output/auth-response";
import { UserInput } from "./dto/input/user-input";
import { User } from "./entities/user.entity";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
}
