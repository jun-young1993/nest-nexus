import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { MyCarService } from 'src/parking-location/my-car.service';
import { NoticeViewService } from 'src/notice/notice-view.service';
import { NoticeService } from 'src/notice/notice.service';
import { AppRewardService } from 'src/app-reward/app-reward.service';
import {
  TransactionSource,
  TransactionType,
} from 'src/app-reward/entities/point-transaction.entity';
import { RewardName } from 'src/app-reward/entities/reward-config.entity';
import { ProcessRewardDto } from 'src/app-reward/dto/process-reward.dto';
import { createNestLogger } from 'src/factories/logger.factory';

@Injectable()
export class TasksService {
  private readonly logger = createNestLogger(TasksService.name);
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly myCarService: MyCarService,
    private readonly noticeViewService: NoticeViewService,
    private readonly noticeService: NoticeService,
    private readonly appRewardService: AppRewardService,
  ) {}

  @Cron('0 */2 * * * *')
  async checkExpectedTimeCarNumbers() {
    const isDev = this.configService.getOrThrow('app.is_dev', {
      infer: true,
    });
    if (isDev) {
      return;
    }
    this.logger.info('[CHECK EXPECTED TIME CAR NUMBERS][START]');
    const carNumbers = await this.myCarService.findCarNumbersWithExpiredTime(5);
    this.logger.info(
      `[CHECK EXPECTED TIME CAR NUMBERS][END] ${carNumbers.length}`,
    );

    if (carNumbers.length > 0) {
      carNumbers.forEach((carNumber) => {
        this.myCarService.update(carNumber.id, {
          isParked: !carNumber.isParked,
          expectedTime: null,
        });
      });
    }
    // 예상 시간이 만료된 차량 번호 목록을 체크하는 크론 작업
  }

  @Cron('0 0 8 * * *')
  async getNoticeBonus() {
    this.logger.info('[GET NOTICE BONUS][START]');
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
