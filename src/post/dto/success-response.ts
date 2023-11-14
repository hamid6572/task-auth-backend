import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuccessResponse {
  @Field({ nullable: true })
  success: boolean;

  @Field({ nullable: true })
  message: string;

  @Field({ nullable: true })
  id: number;

  constructor(message: string = 'Post deleted successfully', id: number) {
    this.success = true;
    this.message = message;
    this.id = id;
  }
}
