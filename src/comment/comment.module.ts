import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { Comment } from './entities/comment.entity';
import { CommentSubscriber } from './comment.subscriber';
import { SearchModule } from '../search/search.module';
import { CommonModule } from '../common/common.module';

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
