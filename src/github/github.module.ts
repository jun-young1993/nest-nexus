import { Module } from '@nestjs/common';
import { GithubContentService } from './github-content.service';
import { GithubController } from './github.controller';
import { GithubResolver } from './github.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GithubRepositoryService } from './github-repository.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/github/schema.gql'),
      path: '/graphql/github',
    }),
  ],
  providers: [GithubRepositoryService, GithubContentService, GithubResolver],
  controllers: [GithubController],
  exports: [GithubRepositoryService, GithubContentService, GithubResolver],
})
export class GithubModule {}
