import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => PostModule)
  ],
  providers: [CommentService, CommentResolver, CommentRepository],
  exports: [CommentService, CommentRepository]
})
export class CommentModule {}
