import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from '../entities/comment.entity.js';

@ObjectType()
export class CommentsResponse {
  @Field(() => [Comment])
  comments: Comment[];

  @Field(() => Int)
  total: number;
}
