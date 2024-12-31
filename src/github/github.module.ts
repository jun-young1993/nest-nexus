import { Module } from '@nestjs/common';
import { GithubContentService } from './github-content.service';
import { GithubController } from './github.controller';

@Module({
  providers: [GithubContentService],
  controllers: [GithubController],
  exports: [GithubContentService],
})
export class GithubModule {}
