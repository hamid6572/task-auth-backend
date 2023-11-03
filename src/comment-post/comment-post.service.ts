import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { User } from "../user/entities/user.entity";
import { CommentService } from "../comment/comment.service";
import { PostService } from "../post/post.service";
import { Post } from "../post/entities/post.entity";

@Injectable()
export class CommentPostService {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly dataSource: DataSource
  ) {}

  async deletePostAndComments(
    id: number,
    user: User,
  ): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner()
    let post = new Post();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        await this.commentService.deleteCommentAndRepliesByRawQuery(id, queryRunner.manager);
        post = await this.postService.deletePost(id, queryRunner.manager);

        await queryRunner.commitTransaction()
    } catch (err) {
        await queryRunner.rollbackTransaction()
    } finally {
        await queryRunner.release()
    }

    return post
  }
}
