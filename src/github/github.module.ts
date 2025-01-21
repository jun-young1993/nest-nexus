import { Module } from '@nestjs/common';
import { GithubContentService } from './github-content.service';
import { GithubController } from './github.controller';
import { GithubRepositoryService } from './github-repository.service';
import { GithubCommitService } from './github-commit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubContent } from './entities/github-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GithubContent])],
  providers: [
    GithubCommitService,
    GithubRepositoryService,
    GithubContentService,
  ],
  controllers: [GithubController],
  exports: [GithubCommitService, GithubRepositoryService, GithubContentService],
})
export class GithubModule {}
