import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType('CreatePostInputModel')
export class CreatePostInputModel {
    @Field(() => [String])
    tagIds: string[];

    @Field()
    title: string;

    @Field()
    content: string;
}

