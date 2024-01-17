import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity.js';

@ObjectType()
export class PaginatedPostsResponse {
  @Field(() => [Post])
  posts: Post[];

  @Field(() => Int)
  total: number;
}
