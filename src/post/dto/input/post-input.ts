import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from './file-type.js';

@InputType()
export class postInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>;
}
