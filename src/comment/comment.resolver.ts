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
import { CommentInput } from './dto/input/comment-input';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CommentService } from './comment.service';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { ReplyInput } from './dto/input/reply-input';
import { Post } from '../post/entities/post.entity';
import { SuccessResponse } from '../post/dto/success-response';
import { PaginationInput } from '../post/dto/input/post-pagination-input';

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

  @UseGuards(JwtAuthGuard)
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
