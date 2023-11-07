import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CommentPostService } from './comment-post.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { SuccessResponse } from '../post/dto/success-response';

@Resolver()
export class CommentPostResolver {
  constructor(private readonly commentPostService: CommentPostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async deletePost(@Args('id') id: number, @CurrentUser() user: User) {
    return await this.commentPostService.deletePostAndComments(id);
  }
}
