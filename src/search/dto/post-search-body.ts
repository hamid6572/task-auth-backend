import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserForElasticsearch {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

@ObjectType()
export class PostSearchBody {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => UserForElasticsearch)
  user: UserForElasticsearch;
}
