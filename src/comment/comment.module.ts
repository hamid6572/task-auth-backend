import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostModule } from '../post/post.module.js';
import { Comment } from './entities/comment.entity.js';
import { SearchModule } from '../search/search.module.js';
import { CommonModule } from '../common/common.module.js';
import { CommentService } from './comment.service.js';
import { CommentResolver } from './comment.resolver.js';
import { CommentRepository } from './comment.repository.js';
import { CommentSubscriber } from './comment.subscriber.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PostModule,
    SearchModule,
    CommonModule,
  ],
  providers: [
    CommentService,
    CommentResolver,
    CommentRepository,
    CommentSubscriber,
  ],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
