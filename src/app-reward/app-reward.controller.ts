import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppRewardService } from './app-reward.service';
import { ProcessRewardDto } from './dto/process-reward.dto';
import { UserPointBalance } from './entities/user-point-balance.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { UserRewardUsage } from './entities/user-reward-usage.entity';
import { TransactionSource } from './entities/point-transaction.entity';

@ApiTags('app-reward')
@Controller('app-reward')
export class AppRewardController {
  constructor(private readonly appRewardService: AppRewardService) {}

  @Get('points/:userId')
  @ApiOperation({ summary: '사용자 포인트 잔액 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '포인트 잔액 조회 성공',
    type: UserPointBalance,
  })
  async getUserPoints(
    @Param('userId') userId: string,
  ): Promise<UserPointBalance> {
    return this.appRewardService.getUserPointBalance(userId);
  }

  @Post('reward')
  @ApiOperation({ summary: '리워드 처리 (광고 시청 등)' })
  @ApiResponse({
    status: 201,
    description: '리워드 처리 성공',
    type: PointTransaction,
  })
  async processReward(
    @Body() processDto: ProcessRewardDto,
  ): Promise<PointTransaction> {
    return this.appRewardService.processReward(processDto);
  }

  @Post('reward/admob')
  @ApiOperation({ summary: 'AdMob 리워드 처리' })
  @ApiResponse({
    status: 201,
    description: 'AdMob 리워드 처리 성공',
    type: PointTransaction,
  })
  async processAdmobReward(
    @Body() processDto: ProcessRewardDto,
  ): Promise<PointTransaction> {
    return this.appRewardService.processReward({
      ...processDto,
      source: TransactionSource.ADMOB_REWARD,
    });
  }

  @Get('transactions/:userId')
  @ApiOperation({ summary: '사용자 거래 내역 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiQuery({
    name: 'limit',
    description: '조회 개수',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    description: '조회 시작 위치',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '거래 내역 조회 성공',
    type: [PointTransaction],
  })
  async getUserTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PointTransaction[]> {
    return this.appRewardService.getUserTransactions(
      userId,
      limit || 50,
      offset || 0,
    );
  }

  @Get('daily-usage/:userId')
  @ApiOperation({ summary: '사용자 일일 리워드 사용 현황 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiQuery({
    name: 'date',
    description: '조회 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '일일 사용 현황 조회 성공',
    type: [UserRewardUsage],
  })
  async getUserDailyUsage(
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ): Promise<UserRewardUsage[]> {
    const targetDate = date ? new Date(date) : new Date();
    return this.appRewardService.getUserDailyUsage(userId, targetDate);
  }

  @Get('health')
  @ApiOperation({ summary: '헬스 체크' })
  @ApiResponse({ status: 200, description: '서비스 정상 동작' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
