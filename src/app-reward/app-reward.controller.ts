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
import {
  PointTransaction,
  TransactionType,
} from './entities/point-transaction.entity';
import { UserRewardUsage } from './entities/user-reward-usage.entity';
import { TransactionSource } from './entities/point-transaction.entity';
import { RewardName, RewardType } from './entities/reward-config.entity';
import { NoticeViewService } from 'src/notice/notice-view.service';
import { NoticeService } from 'src/notice/notice.service';
import { PointWithdrawal } from './entities/point-withdrawal.entity';
import { CreatePointWithdrawalDto } from './dto/create-point-withdrawal.dto';

@ApiTags('app-reward')
@Controller('app-reward')
export class AppRewardController {
  constructor(
    private readonly appRewardService: AppRewardService,
    private readonly noticeViewService: NoticeViewService,
    private readonly noticeService: NoticeService,
  ) {}

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
    name: 'rewardType',
    description: '리워드 타입',
    required: false,
    enum: RewardType,
  })
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
    @Query('rewardType') rewardType?: RewardType,
  ): Promise<UserRewardUsage[]> {
    const targetDate = date ? new Date(date) : new Date();
    console.log('rewardType', rewardType);
    return this.appRewardService.getUserDailyUsage(
      userId,
      targetDate,
      rewardType,
    );
  }

  @Post('withdrawal')
  @ApiOperation({ summary: '포인트 출금 요청 처리' })
  @ApiResponse({
    status: 200,
    description: '출금 요청 처리 성공',
    type: PointWithdrawal,
  })
  async completeWithdrawal(
    @Body() createPointWithdrawalDto: CreatePointWithdrawalDto,
  ): Promise<PointWithdrawal> {
    return this.appRewardService.createPointWithdrawal(
      createPointWithdrawalDto,
    );
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

  @Get('notice-view')
  @ApiOperation({ summary: '노티스 보너스 리워드 처리' })
  @ApiResponse({ status: 200, description: '노티스 보너스 리워드 처리 성공' })
  async getNoticeBonus(): Promise<any[]> {
    const noticeViews = await this.noticeViewService.findInactiveNoticeViews();
    for (const noticeView of noticeViews) {
      const notice = await this.noticeService.findOneBase({
        where: {
          id: noticeView.noticeId,
        },
      });
      if (notice && noticeView.count > 0) {
        await this.noticeViewService.updateActiveNoticeViewsByNoticeId(
          noticeView.noticeId,
        );

        const rewardConfig = await this.appRewardService.getRewardConfig(
          TransactionSource.DAILY_BONUS,
          RewardName.NOTICE_BONUS,
        );

        rewardConfig.pointsPerReward = noticeView.count;
        rewardConfig.description = `게시글[${notice.title}] 조회수 리워드 정산: ${noticeView.count}P`;

        const processRewardDto = ProcessRewardDto.fromJson({
          userId: notice.userId,
          source: TransactionSource.DAILY_BONUS,
          referenceId: notice.id,
          rewardName: RewardName.NOTICE_BONUS,
          appId: 'notice-bonus',
        });

        await this.appRewardService.processPoint(
          processRewardDto,
          rewardConfig,
          TransactionType.EARN,
        );
      }
    }
    return noticeViews;
  }
}
