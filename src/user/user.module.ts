import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common/common.module';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRepository } from './user.repository';
import { JwtAuthService } from './jwt-auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { User } from './entities/user.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([User]),
    CommonModule,
  ],
  providers: [
    UserService,
    UserResolver,
    UserRepository,
    JwtAuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
