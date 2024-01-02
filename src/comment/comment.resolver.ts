import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentInput } from './dto/input/comment-input.js';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { CommentService } from './comment.service.js';
import { User } from '../user/entities/user.entity.js';
import { Comment } from './entities/comment.entity.js';
import { ReplyInput } from './dto/input/reply-input.js';
import { Post } from '../post/entities/post.entity.js';
import { SuccessResponse } from '../post/dto/success-response.js';
import { PaginationInput } from '../post/dto/input/post-pagination-input.js';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async createComment(
    @Args('data') data: CommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentService.addComment(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Comment)
  async Comment(
    @Args('postId', { type: () => Int }) commentId: number,
  ): Promise<Comment> {
    return this.commentService.comment(commentId);
  }

  //  @UseGuards(JwtAuthGuard)
  @Query(() => [Comment])
  async getComment(
    @Args('postId', { type: () => Int }) postId: number,
    @Args() paginationInput: PaginationInput,
  ): Promise<Comment[]> {
    return this.commentService.commentsByPost(postId, paginationInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Comment])
  async getRepliesOfComment(
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args() paginationInput: PaginationInput,
  ): Promise<Comment[]> {
    return this.commentService.repliesOfComment(commentId, paginationInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Comment])
  async listComments(): Promise<Comment[]> {
    return await this.commentService.comments();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: CommentInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    return this.commentService.updateComment(id, data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async deleteCommentByPost(
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<SuccessResponse> {
    return this.commentService.deleteCommentAndReplies(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async addReplyToComment(
    @Args('data') data: ReplyInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentService.addReplyToComment(data, user);
  }

  @ResolveField(() => User)
  async user(@Parent() comment: Comment): Promise<User> {
    return this.commentService.getUserByCommentId(comment.id);
  }

  @ResolveField(() => Post)
  async post(@Parent() comment: Comment): Promise<Post> {
    return this.commentService.getPostByCommentId(comment.id);
  }
}
