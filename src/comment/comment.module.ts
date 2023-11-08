import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostModule } from '../post/post.module';
import { Comment } from './entities/comment.entity';
import { SearchModule } from '../search/search.module';
import { CommonModule } from '../common/common.module';
import {
  CommentRepository,
  CommentResolver,
  CommentService,
  CommentSubscriber,
} from './';

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
