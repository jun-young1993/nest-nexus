import { Controller, Get } from '@nestjs/common';
import { CloudRunEmotionService } from './cloud-run-emotion.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Cloud Run / Emotion')
@Controller('cloud-run/emotion')
export class CloudRunEmotionController {
  constructor(
    private readonly cloudRunEmotionService: CloudRunEmotionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'cloud run emotion index' })
  @ApiResponse({ status: 200, description: 'Success', type: String })
  async index() {
    return this.cloudRunEmotionService.index();
  }
}
