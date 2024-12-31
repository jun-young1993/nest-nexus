import { Resolver, Query, Args } from '@nestjs/graphql';
import { GithubRepositoryService } from './github-repository.service';
import { Content, Directory, FileContent } from './github.models';

@Resolver()
export class GithubResolver {
  constructor(
    private readonly githubRepositoryService: GithubRepositoryService,
  ) {}

  @Query(() => [Content])
  async getRepositoryContents(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
    @Args('type', { nullable: true, type: () => String }) type?: 'file' | 'dir',
  ) {
    console.log('is file',await this.githubRepositoryService.getRepositoryContents(
      repository,
      type,
      path,
    ))
    return this.githubRepositoryService.getRepositoryContents(
      repository,
      type,
      path,
    );
  }

  @Query(() => [Directory])
  async getRepositoryDirectories(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
  ) {
    return this.githubRepositoryService.getRepositoryContents(
      repository,
      'dir',
      path,
    );
  }

  @Query(() => [FileContent])
  async getRepositoryFiles(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
  ) {
    return this.githubRepositoryService.getRepositoryContents(
      repository,
      'file',
      path,
    );
  }
}
