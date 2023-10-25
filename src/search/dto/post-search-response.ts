import { Field, ObjectType } from "@nestjs/graphql";
import { PostSearchBody } from "./post-search-body";

@ObjectType()
export class PostSearchResponse {
  @Field()
  results: {
    total: number;
    hits: Array<{
      _source: PostSearchBody;
    }>;
  };
}
