import { registerEnumType } from '@nestjs/graphql';

export enum PostType {
  POST = 'post',
  PROJECT = 'project',
}

registerEnumType(PostType, {
  name: 'PostType',
  description: '게시글 타입',
});
