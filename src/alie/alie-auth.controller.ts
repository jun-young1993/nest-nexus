import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlieAuthService } from './alie-auth.service';
import { CallbackQueryDto } from './dto/callback-dto';
import { GenerateTokenDto } from './dto/generate-token.dto';

@ApiTags('alie-auth')
@Controller('alie-auth')
export class AlieAuthController {
  constructor(private readonly alieAuthService: AlieAuthService) {}

  @Get('callback')
  @ApiOperation({ summary: `alie auth callback` })
  async callback(@Query() { code }: CallbackQueryDto) {
    return await this.alieAuthService.callback();
  }

  @Get('o-auth')
  @ApiOperation({ summary: `alie oAuth` })
  async oAuth() {
    return await this.alieAuthService.oAuth();
  }

  @Post('generate-token')
  @ApiOperation({ summary: `alie oAuth` })
  @ApiBody({
    description: 'Request body for generating token',
    type: GenerateTokenDto,
  })
  async getGenerateToken(@Body() body: GenerateTokenDto) {
    return await this.alieAuthService.getGenerateToken(body);
  }
}
