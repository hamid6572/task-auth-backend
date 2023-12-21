import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CommentPostService } from './comment-post.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { User } from '../user/entities/user.entity.js';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard.js';
import { SuccessResponse } from '../post/dto/success-response.js';

@Resolver()
export class CommentPostResolver {
  constructor(private readonly commentPostService: CommentPostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async deletePost(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.commentPostService.deletePostAndComments(id);
  }
}
