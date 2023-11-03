import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CommentService } from "../comment/comment.service";
import { PostService } from "../post/post.service";
import { Post } from "../post/entities/post.entity";
import { SuccessResponse } from "../post/dto/success-response";

@Injectable()
export class CommentPostService {
  constructor(
private readonly commentService: CommentService,
    private readonly postService: PostService,
private readonly dataSource: DataSource
  ) {}

  async deletePostAndComments(
    id: number,
  ): Promise<SuccessResponse> {
    const queryRunner = this.dataSource.createQueryRunner()
    let post = new Post();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        await this.commentService.deleteCommentAndReplies(id);
        post = await this.postService.deletePost(id, queryRunner.manager);

        await queryRunner.commitTransaction()
    } catch (err) {
        await queryRunner.rollbackTransaction()
    } finally {
        await queryRunner.release()
    }

    return new SuccessResponse('Post deleted successfully'); 
  }
}
