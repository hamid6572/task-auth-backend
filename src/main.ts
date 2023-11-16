import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './websocket/redis-adaptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const redisIoAdapter = new RedisIoAdapter(app, app.get(ConfigService));
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(3000);
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as cluster from 'cluster';
// import { cpus } from 'os';
// import { RedisIoAdapter } from './websocket/redis-adaptor';
// export const clusterModule = cluster as unknown as cluster.Cluster;
// const numCPUs = cpus().length;
// const workers = {};
// async function bootstrap() {
//   if (clusterModule.isPrimary) {
//     console.log(`
//              Master server started,proccess.pid:${process.pid},
//              number of cpus: ${numCPUs}
//      `);
//     for (let i = 0; i < numCPUs; i++) {
//       workers[i] = clusterModule.fork();
//       workers[i].on('exit', (worker, code, signal) => {
//         console.log(`
//                       Worker with code: ${code} and
//                       signal: ${signal} is   Restarting...
//              `);
//         workers[i] = clusterModule.fork();
//       });
//     }
//   } else {
//     const app = await NestFactory.create(AppModule);
//     console.log(`
//        Worker server started, process.pid: ${process.pid}
//     `);
//     const redisIoAdapter = new RedisIoAdapter(app);
//     await redisIoAdapter.connectToRedis();
//     app.useWebSocketAdapter(redisIoAdapter);
//     await app.listen(0);
//   }
// }
// bootstrap();
