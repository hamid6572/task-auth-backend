import { HttpStatus, Module } from "@nestjs/common";
import { AppResolver } from "./app.resolver";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { PostModule } from "./post/post.module";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from "@nestjs/core";
import { GlobalErrorInterceptor } from "./middleware/error.middleware";
import { CommentModule } from "./comment/comment.module";
import { CommonModule } from './common/common.module';
import { CommentPostModule } from "./comment-post/comment-post.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        migrations: ['/migrations/*{.ts,.js}'],
        migrationsTableName: '_migrations',
        migrationsRun: true,
        entities: ['./**/*.entity{.ts,.js}'],
        synchronize: !!config.get<string>('DB_SYNC') || false,
//        logging: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "schema.gql",
      sortSchema: true,
      playground: true,
      introspection: true,
      fieldResolverEnhancers: ["interceptors"],
      formatError: (error: GraphQLError | any) => {
        // GraphQLError type
        // => format errors
        console.log(
          JSON.stringify(error),
          error?.extensions?.response?.message
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
            "Something went wrong",
        };
        return graphQLFormattedError;
      },
    }),
    UserModule,
    PostModule,
    CommentModule,
    CommonModule,
    CommentPostModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalErrorInterceptor,
    },
    AppResolver,
  ],
})
export class AppModule {}