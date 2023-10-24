import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/entities/user.entity";
import { Post } from "../post/entities/post.entity";
import { CommentPostService } from "./comment-post.service";

@Resolver()
export class CommentPostResolver {
  constructor(private readonly commentPostService: CommentPostService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async deletePost(@Args("id") id: number, @CurrentUser() user: User) {
    return await this.commentPostService.deletePostAndComments(id, user)
  }
}