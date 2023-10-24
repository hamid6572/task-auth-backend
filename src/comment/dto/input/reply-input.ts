import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

@InputType()
export class ReplyInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field( { nullable: true })
  @IsNumber()
  postId?: number;

  @Field( { nullable: true })
  @IsNumber()
  commentId?: number;
}
