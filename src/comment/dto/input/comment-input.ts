import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  postId?: number;
}
