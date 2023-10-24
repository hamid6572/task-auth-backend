import { Injectable } from "@nestjs/common";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { CommonService } from "../common/common.service";
import { JwtAuthService } from "./jwt-auth.service";
import { LoginInput } from "./dto/input/auth-input";
import { UserRepository } from "./user.repository";
import { UserInput } from "./dto/input/user-input";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly commonService: CommonService
  ) {}

  async user(email: any) { 
   return await this.userRepository
      .createQueryBuilder('user')
      .where({email: email})
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('user.comments', 'comment')
      .getOne();
  }

  validatePassword(pwd: string, dbPwd: string): boolean {
    const isValidPwd = pwd && this.commonService.comparePassword(pwd, dbPwd);
    if (!isValidPwd) throw new BadRequestException("Invalid password!");

    return true;
  }

  async validateUser(email: string, password: string){
    const user = await this.user(email);
    if (!user) throw new UnauthorizedException("Invalid username or user may not exist!");   
    
    const isValidPwd = this.validatePassword(password, user?.password);
    if (isValidPwd) return user;

    throw new UnauthorizedException("Invalid username or password");
  }

  async createUser(userData: UserInput) {
    if (await this.user(userData.email)) throw new Error("User already exists!");
    const user = await this.userRepository.save({
        email: userData.email,
        password: this.commonService.encodePassword(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName
    });    
    if (!user) throw new Error("There's some issue creating user!");

    const token = await this.jwtAuthService.getJwtToken({
      id: user.id,
      email: user.email,
    });
    return { token: `Bearer ${token}`, user };
  }

  async loginUser(loginData: LoginInput) {    
    const user = await this.user(loginData.email);
    if (!user) throw new Error("No user Exists!");

    const token = await this.jwtAuthService.getJwtToken({
      id: user.id,
      email: user.email,
    });

    return { token: `Bearer ${token}`, user };
  }

}
