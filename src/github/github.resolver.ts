import { Resolver, Query, Args } from '@nestjs/graphql';
import { GithubRepositoryService } from './github-repository.service';
import { Directory, FileContent } from './github.models';

@Resolver()
export class GithubResolver {
  constructor(
    private readonly githubRepositoryService: GithubRepositoryService,
  ) {}

  @Query(() => [Directory])
  async getRepositoryDirectories(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
  ) {
    return this.githubRepositoryService.getRepositoryDirectories(
      repository,
      path,
    );
  }
}
