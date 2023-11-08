import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common/common.module';
import { UserService, UserResolver, UserSubscriber, UserRepository } from './';
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
    UserSubscriber,
    UserRepository,
    JwtAuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
