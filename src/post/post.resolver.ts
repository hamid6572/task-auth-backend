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

import { PostService } from './post.service.js';
import { postInput } from './dto/input/post-input.js';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { User } from '../user/entities/user.entity.js';
import { Post } from './entities/post.entity.js';
import { PaginationInput } from './dto/input/post-pagination-input.js';
import { SuccessResponse } from './dto/success-response.js';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async createPost(
    @Args('data') data: postInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    return this.postService.addPost(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Post)
  async getPost(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    return this.postService.post(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  async listPosts(): Promise<Post[]> {
    return this.postService.posts();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: postInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    return this.postService.updatePost(id, data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post], { name: 'search' })
  async searchPosts(@Args('input') input: string): Promise<(Post | User)[]> {
    return this.postService.searchPosts(input);
  }

  // @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  async paginatedPosts(
    @Args() paginationInput: PaginationInput,
  ): Promise<Post[]> {
    console.log('hi there!');

    return this.postService.paginatedPosts(paginationInput);
  }

  @ResolveField(() => User)
  async user(@Parent() post: Post): Promise<User> {
    return this.postService.getUserByPostId(post.id);
  }
}
