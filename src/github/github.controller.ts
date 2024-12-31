import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('github')
@Controller('github')
export class GithubController {}
