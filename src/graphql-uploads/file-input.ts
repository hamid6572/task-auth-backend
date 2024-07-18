import { Field, InputType, Int } from '@nestjs/graphql';
// import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
// import { FileUpload } from './file-type.js';

@InputType()
export class CreateCatInput {
  @Field(() => String)
  name: string;
  @Field(() => String)
  breed: string;
  // @Field(() => GraphQLUpload)
  // image: Promise<FileUpload>;
}
