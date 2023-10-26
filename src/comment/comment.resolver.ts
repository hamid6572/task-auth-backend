import { Resolver, Mutation, Args, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CommentInput } from "./dto/input/comment-input";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";
import { CommentService } from "./comment.service";
import { User } from "../user/entities/user.entity";
import { Comment } from "./entities/comment.entity";
import { ReplyInput } from "./dto/input/reply-input";

@Resolver()
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async createComment(@Args("data") data: CommentInput, @CurrentUser() user: User) {
    return this.commentService.addcomment(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Comment)
  async getComment(@Args("id") id: number) {
    return this.commentService.comment(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Comment])
  async listComments() {
    return await this.commentService.comments();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async updateComment(
    @Args("id") id: number,
    @Args("data") data: CommentInput,
    @CurrentUser() user: User
  ) {
    return this.commentService.updateComment(id, data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => [Comment])
  async deleteCommentByPost(@Args("postId") postId: number, @CurrentUser() user: User) {
    return this.commentService.deleteCommentAndRepliesByRawQuery(postId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async addReplyToComment(
    @Args("data") data: ReplyInput,
    @CurrentUser() user: User
  ) {
    return this.commentService.addReplyToComment(data, user);
  }
}
