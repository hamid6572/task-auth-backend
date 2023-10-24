import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class postInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsString()
  content: string;
}
