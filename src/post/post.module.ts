import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostTag } from './entities/post-tag.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import {PostTagService} from "./post-tag.service";
import {PostTagResolver} from "./post-tag.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostTag]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/post/schema.gql'),
      path: '/graphql/post',
    }),
  ],
  providers: [PostService, PostTagService, PostResolver, PostTagResolver],
  exports: [PostService, PostTagService, PostResolver, PostTagResolver],
})
export class PostModule {}
