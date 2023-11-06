import { Field, ObjectType, Float, Int } from "@nestjs/graphql";
import { UserForElasticsearch } from "./post-search-body";

@ObjectType()
class ShardsResponse {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  successful: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  skipped?: number;
}

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

@ObjectType()
export class ElasticsearchHit {
  @Field(() => String)
  _index: string;

  @Field(() => String)
  _type: string;

  @Field(() => String)
  _id: string;

  @Field(() => Float)
  _score: number;

  @Field(() => ElasticsearchSource)
  _source: ElasticsearchSource;
}

@ObjectType()
class ElasticsearchHitsTotal {
  @Field(() => Int)
  value: number;
  
  @Field()
  relation: string;
}

@ObjectType()
class ElasticsearchHits {
  @Field(() => ElasticsearchHitsTotal)
  total?: ElasticsearchHitsTotal | number;
  
  @Field(() => Float)
  max_score?: number;
  
  @Field(() => [ElasticsearchHit])
  hits: ElasticsearchHit[];
}

@ObjectType()
export class ElasticSearchResponse {
  @Field(() => Int)
  took: number;

  @Field()
  timed_out: boolean;

  @Field(() => String, { nullable: true })
  _scroll_id?: string;

  @Field(() => ShardsResponse)
  _shards: ShardsResponse;

  @Field(() => Float)
  max_score?: number;

  @Field(() => ElasticsearchHits)
  hits: ElasticsearchHits;

  @Field(() => String, { nullable: true })
  aggregations?: any;
}
