import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { CommonModule } from '../common/common.module.js';
import { JwtAuthService } from './jwt-auth.service.js';
import { JwtStrategy } from './strategy/jwt.strategy.js';
import { LocalStrategy } from './strategy/local.strategy.js';
import { User } from './entities/user.entity.js';
import { UserService } from './user.service.js';
import { UserResolver } from './user.resolver.js';
import { UserSubscriber } from './user.subscriber.js';
import { UserRepository } from './user.repository.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
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
