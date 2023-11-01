import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CommentSearchBody {
  @Field()
  id: number;
  
  @Field()
  text: string;
  
  @Field({ nullable: true })
  postId: number;
}
