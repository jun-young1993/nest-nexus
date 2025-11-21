import { Body, Controller, Post } from '@nestjs/common';
import { LibreService } from './libre.service';
import { CreateTranslateDto } from './dto/create-translate.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';

@ApiTags('AI Translate - Libre')
@Controller('ai/translate/libre')
export class LibreController {
  constructor(private readonly libreService: LibreService) {}

  @ApiOperation({ summary: 'Translate text' })
  @ApiBody({ type: CreateTranslateDto })
  @ApiResponse({ status: 200, description: 'Translate text successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post('translate')
  async translate(@Body() { text, source, target }: CreateTranslateDto) {
    return this.libreService.translate(text, source, target);
  }
}
