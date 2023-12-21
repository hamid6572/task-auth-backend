import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module.js';
import { SearchModule } from '../search/search.module.js';
import { CommonModule } from '../common/common.module.js';
import { PostService } from './post.service.js';
import { PostResolver } from './post.resolver.js';
import { PostRepository } from './post.repository.js';
import { PostSubscriber } from './post.subscriber.js';

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
