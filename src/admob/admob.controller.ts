import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdmobLogger, baseLogData } from '../config/logger.config';
import { AppRewardService } from '../app-reward/app-reward.service';
import { TransactionSource } from '../app-reward/entities/point-transaction.entity';

@ApiTags('admob')
@Controller('admob')
export class AdmobController {
  private readonly admobLogger: AdmobLogger;

  constructor(private readonly appRewardService: AppRewardService) {
    this.admobLogger = new AdmobLogger();
  }

  @Get('reward-callback/:appId/:type')
  @ApiOperation({ summary: 'Reward callback' })
  @ApiParam({ name: 'type', description: 'Reward type' })
  @ApiResponse({ status: 200, description: 'Reward callback' })
  async rewardCallback(
    @Param('appId') appId: string,
    @Param('type') type: string,
    @Query('user_id') userId: string,
    @Req() request: Request,
  ) {
    console.log('appId', appId);
    console.log('type', type);
    this.admobLogger.log(
      `AdMob reward callback received \r\n userId: ${userId} appId: ${appId} type: ${type}`,
      baseLogData(request),
    );

    // TODO: 실제 사용자 ID를 받아서 처리
    // 현재는 테스트용으로 하드코딩된 사용자 ID 사용

    try {
      const transaction = await this.appRewardService.processReward({
        userId: userId,
        source: TransactionSource.ADMOB_REWARD,
        referenceId: `${appId}-${type}`,
        metadata: JSON.stringify({ appId, type }),
        appId: appId,
        rewardName: type,
      });

      this.admobLogger.log(
        `AdMob reward processed successfully: ${transaction.id}`,
      );

      return { success: true, transactionId: transaction.id };
    } catch (error) {
      this.admobLogger.log(`AdMob reward processing failed: ${error.message}`);
      throw error;
    }
  }
}
