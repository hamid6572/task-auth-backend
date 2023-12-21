import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { RedisIoAdapter } from './websocket/redis-adaptor.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const redisIoAdapter = new RedisIoAdapter(app, app.get(ConfigService));
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
