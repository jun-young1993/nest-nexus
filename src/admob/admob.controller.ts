import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdmobLogger } from '../config/logger.config';

@ApiTags('admob')
@Controller('admob')
export class AdmobController {
  private readonly admobLogger: AdmobLogger;

  constructor() {
    this.admobLogger = new AdmobLogger();
  }

  @Get('reward-callback/:appId/:type')
  @ApiOperation({ summary: 'Reward callback' })
  @ApiParam({ name: 'type', description: 'Reward type' })
  @ApiResponse({ status: 200, description: 'Reward callback' })
  rewardCallback(
    @Param('appId') appId: string,
    @Param('type') type: string,
    @Req() request: Request,
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      type,
      userAgent: request.headers['user-agent'],
      ip: request.ip || request.connection.remoteAddress,
      headers: request.headers,
      query: request.query,
      url: request.url,
      method: request.method,
    };
    console.log('appId', appId);
    //  85b4abd3-8d81-4e8f-92f0-4f419caae155
    console.log('type', type);
    this.admobLogger.log('AdMob reward callback received', logData);

    return true;
  }
}
