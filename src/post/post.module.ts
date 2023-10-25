import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { PostRepository } from './post.repository';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    SearchModule
  ],
  providers: [PostService, PostResolver, PostRepository],
  exports: [PostService]
})
export class PostModule {}
