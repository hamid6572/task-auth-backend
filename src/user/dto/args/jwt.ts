import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Jwt {
  @Field()
  id: string;

  @Field()
  firstName: string;
}
