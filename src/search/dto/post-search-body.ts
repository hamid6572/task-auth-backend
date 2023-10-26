import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class PostSearchBody {
  @Field()
  id: number;
  
  @Field()
  title: string;
  
  @Field()
  content: string;

  @Field()
  user: User;

}
