import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CommentService } from '../comment/comment.service';
import { PostService } from '../post/post.service';
import { SuccessResponse } from '../post/dto/success-response';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class CommentPostService {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
  ) {}

  async deletePostAndComments(id: number): Promise<SuccessResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    let post: Post;
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.commentService.deleteCommentAndReplies(
        id,
        queryRunner.manager,
      );
      post = await this.postService.deletePost(id, queryRunner.manager);

      await queryRunner.commitTransaction();
      return new SuccessResponse('Post deleted successfully', post?.id);
    } catch (err) {
      console.log(err);

      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
