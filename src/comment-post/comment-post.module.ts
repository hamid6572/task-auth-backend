import { Module } from '@nestjs/common';

import { CommentPostService } from './comment-post.service.js';
import { CommentPostResolver } from './comment-post.resolver.js';
import { CommentModule } from '../comment/comment.module.js';
import { PostModule } from '../post/post.module.js';

@Module({
  imports: [CommentModule, PostModule],
  providers: [CommentPostService, CommentPostResolver],
})
export class CommentPostModule {}
