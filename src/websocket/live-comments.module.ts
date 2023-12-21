import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { WebsocketGateway } from './live-comments.gateway.js';
import { RedisIoAdapter } from './redis-adaptor.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [WebsocketGateway, RedisIoAdapter],
})
export class WebsocketModule {}
