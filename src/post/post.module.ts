import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { PostRepository } from './post.repository';
import { UserModule } from '../user/user.module';
import { SearchModule } from '../search/search.module';
import { PostSubscriber } from './post.subscriber';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
    SearchModule,
    CommonModule,
  ],
  providers: [PostService, PostResolver, PostRepository, PostSubscriber],
  exports: [PostService],
})
export class PostModule {}
