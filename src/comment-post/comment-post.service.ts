import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/entities/user.entity";
import { CommentService } from "../comment/comment.service";
import { PostService } from "../post/post.service";

@Injectable()
export class CommentPostService {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  async deletePostAndComments(id: number,user: User){
    await this.commentService.deleteCommentAndRepliesByRawQuery(id, user);
    return this.postService.deletePost(id, user);
  }
}
