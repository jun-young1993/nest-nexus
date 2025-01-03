import { Resolver, Query, Args } from '@nestjs/graphql';
import { GithubRepositoryService } from './github-repository.service';
import { Commit, Content } from './github.models';
import { GithubCommitService } from './github-commit.service';
import { GithubContentService } from './github-content.service';

@Resolver()
export class GithubResolver {
  constructor(
    private readonly githubRepositoryService: GithubRepositoryService,
    private readonly githubContnetService: GithubContentService,
    private readonly githubCommitService: GithubCommitService,
  ) {}

  @Query(() => [Content])
  async getContents(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
    @Args('type', { nullable: true, type: () => String }) type?: 'file' | 'dir',
  ) {
    return this.githubContnetService.getContents(repository, type, path);
  }

  @Query(() => [Commit])
  async getCommits(
    @Args('repository', { type: () => String }) repository: string,
    @Args('path', { nullable: true, type: () => String }) path = '',
  ) {
    const commits = await this.githubCommitService.getCommits(repository, path);
    return commits.map(async (commit) => {
      const sha = commit.sha;
      const detail = await this.githubCommitService.getCommitDetails(
        repository,
        sha,
      );
      const files = detail.files.map(async (file) => {
        const fileContent = await this.githubContnetService.getContents(
          repository,
          'file',
          file.filename,
        );
        return {
          ...file,
          content: fileContent.content,
        };
      });

      return {
        ...commit,
        detail: {
          ...detail,
          files: files,
        },
      };
    });
  }
}
