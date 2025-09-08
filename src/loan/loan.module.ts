import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { PaymentScheduleSchedulerService } from './payment-schedule-scheduler.service';
import { Loan } from './entities/loan.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { Prepayment } from './entities/prepayment.entity';
import { PrepaymentSchedule } from './entities/prepayment-schedule.entity';
import { LoanAnalytics } from './entities/loan-analytics.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FcmAdminModule } from 'src/fcm-admin/fcm-admin.module';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      PaymentSchedule,
      Prepayment,
      PrepaymentSchedule,
      LoanAnalytics,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    FcmAdminModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return configService.get('loanScheduleFcm');
      },
    }),
  ],
  controllers: [LoanController],
  providers: [LoanService, PaymentScheduleSchedulerService],
  exports: [LoanService, PaymentScheduleSchedulerService],
})
export class LoanModule {}
