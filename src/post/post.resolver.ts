import { Resolver, Mutation, Args, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PostService } from "./post.service";
import { postInput } from "./dto/input/post-input";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/entities/user.entity";
import { Post } from "./entities/post.entity";
import { SearchInput } from "./dto/input/search-input";
import { PostPaginationInput } from "./dto/input/post-pagination-input";

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@Args("data") data: postInput, @CurrentUser() user: User) {
    return this.postService.addpost(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Post)
  async getPost(@Args("id") id: number) {
    return this.postService.post(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  async listPosts() {
    return this.postService.posts();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(
    @Args("id") id: number,
    @Args("data") data: postInput,
    @CurrentUser() user: User
  ) {
    return this.postService.updatePost(id, data, user)
  }
  
  @UseGuards(JwtAuthGuard)
  @Query(() => [Post], { name: 'search' })
  async searchPosts(@Args('input') input: string): Promise<(Post | User)[]> {
    return this.postService.searchPosts(input)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  async paginatedPosts(@Args() paginationInput: PostPaginationInput): Promise<Post[]> {
    return this.postService.paginatedPosts(paginationInput)
  }
}