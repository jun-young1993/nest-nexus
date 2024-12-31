import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Directory {
  @Field()
  name: string;

  @Field()
  path: string;
}

@ObjectType()
export class FileContent {
  @Field()
  name: string;

  @Field()
  content: string;
}
