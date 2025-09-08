import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaymentSchedule,
  PaymentStatus,
} from './entities/payment-schedule.entity';
import { PaymentScheduleSchedulerLogger } from 'src/config/logger.config';

/**
 * Payment Schedule 스케줄러 서비스
 * 매일 실행되어 내일 상환 예정인 스케줄을 조회합니다.
 */
@Injectable()
export class PaymentScheduleSchedulerService {
  private readonly logger = new PaymentScheduleSchedulerLogger();

  constructor(
    @InjectRepository(PaymentSchedule)
    private readonly paymentScheduleRepository: Repository<PaymentSchedule>,
  ) {}

  /**
   * 매일 오전 9시에 실행되는 크론 작업
   * 내일 상환 예정인 스케줄을 조회합니다.
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkUpcomingPaymentSchedules(): Promise<void> {
    this.logger.log('Payment Schedule 알림 체크 시작');

    try {
      const upcomingSchedules = await this.getUpcomingPaymentSchedules();

      if (upcomingSchedules.length === 0) {
        this.logger.log('내일 상환 예정인 스케줄이 없습니다.');
        return;
      }

      this.logger.log(
        `내일 상환 예정인 스케줄 ${upcomingSchedules.length}건 발견`,
      );

      // TODO: 여기에 알림 로직을 추가할 수 있습니다.
      // 예: 이메일 발송, 푸시 알림, SMS 등
      for (const schedule of upcomingSchedules) {
        console.log(schedule.paymentDate);
        this.logger.log(
          `상환 예정 알림 - 대출 ID: ${schedule.loanId}, ` +
            `회차: ${schedule.paymentNumber}, ` +
            `금액: ${schedule.totalAmount.toLocaleString()}원, ` +
            `상환일: ${schedule.paymentDate}`,
        );
      }

      this.logger.log('Payment Schedule 알림 체크 완료');
    } catch (error) {
      this.logger.error('Payment Schedule 알림 체크 중 오류 발생:');
      this.logger.error(error);
    }
  }

  /**
   * 내일 상환 예정인 스케줄을 조회합니다.
   * @returns 내일 상환 예정인 PaymentSchedule 배열
   */
  private async getUpcomingPaymentSchedules(): Promise<PaymentSchedule[]> {
    const tomorrow = new Date();
    this.logger.log('[내일 상환 예정인 스케줄 조회 시작]: ' + tomorrow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    return this.paymentScheduleRepository.find({
      where: {
        paymentDate: tomorrow,
        status: PaymentStatus.PENDING,
      },
      relations: ['loan'],
      order: {
        paymentDate: 'ASC',
        paymentNumber: 'ASC',
      },
    });
  }

  /**
   * 수동으로 내일 상환 예정인 스케줄을 조회하는 메서드
   * 테스트나 수동 실행을 위해 사용할 수 있습니다.
   */
  async getUpcomingSchedulesManually(): Promise<void> {
    this.logger.log('수동으로 내일 상환 예정 스케줄 조회');
    return this.checkUpcomingPaymentSchedules();
  }
}
