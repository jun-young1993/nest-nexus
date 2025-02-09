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
import {User} from "../user/entities/user.entity";
import {AuthResolver} from "../auth/auth.resolver";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
      AuthModule,
    TypeOrmModule.forFeature([Post, PostTag, User]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/post/schema.gql'),
      path: '/graphql/post',
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  providers: [PostService, PostTagService, PostResolver, PostTagResolver],
  exports: [PostService, PostTagService, PostResolver, PostTagResolver],
})
export class PostModule {}
