import { Module } from '@nestjs/common';
import { CommentPostService } from './comment-post.service';
import { CommentPostResolver } from './comment-post.resolver';
import { CommentModule } from '../comment/comment.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [CommentModule, PostModule],
  providers: [CommentPostService, CommentPostResolver],
})
export class CommentPostModule {}
