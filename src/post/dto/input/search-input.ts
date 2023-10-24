import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SearchInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  email: string;
}
