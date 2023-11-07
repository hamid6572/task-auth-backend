import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { UserForElasticsearch } from './post-search-body';

@ObjectType()
export class ElasticsearchSource {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field(() => UserForElasticsearch)
  user: UserForElasticsearch;

  @Field({ nullable: true })
  text: string;

  @Field({ nullable: true })
  postId: number;
}
