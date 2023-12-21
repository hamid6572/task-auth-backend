import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import { AppResolver } from './app.resolver.js';
import { CommentModule } from './comment/comment.module.js';
import { CommonModule } from './common/common.module.js';
import { CommentPostModule } from './comment-post/comment-post.module.js';
import { GlobalErrorInterceptor } from './middleware/error.middleware.js';
import { PostModule } from './post/post.module.js';
import { RedisIoAdapter } from './websocket/redis-adaptor.js';
import { SearchModule } from './search/search.module.js';
import { UserModule } from './user/user.module.js';
import { WebsocketModule } from './websocket/live-comments.module.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        migrations: ['dist/migration/**/*.js'],
        migrationsTableName: '_migrations',
        migrationsRun: true,
        entities: ['./**/*.entity{.ts,.js}'],
        synchronize: !!config.get<string>('DB_SYNC') || false,
        //logging: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: true,
      introspection: true,
      fieldResolverEnhancers: ['interceptors'],
      formatError: (error: GraphQLError | any) => {
        // GraphQLError type
        // => format errors
        console.log(
          JSON.stringify(error),
          error?.extensions?.response?.message,
        );
        const graphQLFormattedError: GraphQLFormattedError & {
          status: HttpStatus;
        } = {
          status:
            error?.extensions?.response?.statusCode ||
            HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error?.extensions?.response?.message ||
            error?.message ||
            'Something went wrong',
        };
        return graphQLFormattedError;
      },
    }),
    UserModule,
    PostModule,
    CommentModule,
    CommonModule,
    CommentPostModule,
    SearchModule,
    WebsocketModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalErrorInterceptor,
    },
    AppResolver,
    RedisIoAdapter,
  ],
})
export class AppModule {}
