import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { Comment } from './entities/comment.entity';
import { CommentSubscriber } from './comment.subscriber';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PostModule,
    SearchModule
  ],
  providers: [CommentService, CommentResolver, CommentRepository, CommentSubscriber],
  exports: [CommentService, CommentRepository]
})
export class CommentModule {}
