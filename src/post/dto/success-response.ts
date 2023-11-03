import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SuccessResponse {
    @Field({ nullable: true })
    success: boolean;

    @Field({ nullable: true })
    message: string;

    constructor(message: string = 'Post deleted successfully') {
        this.success = true;
        this.message = message;
    }
}
