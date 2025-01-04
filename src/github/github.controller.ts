import {Controller, Post} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {GithubContentService} from "./github-content.service";

@ApiTags('github')
@Controller('github')
export class GithubController {
    constructor(
        private readonly githubContentService: GithubContentService
    ) {}

    @Post('content/store')
    storeContent(){
        return this.githubContentService.store('Obsidian', '/blog')
    }
}
