import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

import { RedisIoAdapter } from './websocket/redis-adaptor.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const redisIoAdapter = new RedisIoAdapter(app, app.get(ConfigService));
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
