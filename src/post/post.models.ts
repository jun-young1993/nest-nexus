import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
  content: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginationInfo {
  @Field()
  total: number;
  @Field()
  page: number;
  @Field()
  limit: number;
  @Field()
  totalPages: number;
}

@ObjectType()
export class Posts {
  @Field(() => [Post])
  data: [Post];
  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
export class PostTags {
  @Field()
  id: string
  @Field()
  name: string
  @Field()
  color: string
}

@ObjectType()
export class TagWithPostCount {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  color: string;

  @Field()
  postCount: number;
}
