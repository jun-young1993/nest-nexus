import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostTag {
  @Field()
  id: string
  @Field()
  name: string
  @Field()
  color: string
}

@ObjectType()
export class TagWithPostCount extends PostTag {
  @Field()
  postCount: number;
}

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

  @Field(() => [PostTag])
  tags: PostTag[]
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


