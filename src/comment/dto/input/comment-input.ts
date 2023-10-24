import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

@InputType()
export class CommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field( { nullable: true })
  @IsNumber()
  postId?: number;
}
