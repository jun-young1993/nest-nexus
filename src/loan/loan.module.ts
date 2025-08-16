import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { Loan } from './entities/loan.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { Prepayment } from './entities/prepayment.entity';
import { PrepaymentSchedule } from './entities/prepayment-schedule.entity';
import { LoanAnalytics } from './entities/loan-analytics.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      PaymentSchedule,
      Prepayment,
      PrepaymentSchedule,
      LoanAnalytics,
    ]),
    AuthModule,
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}
