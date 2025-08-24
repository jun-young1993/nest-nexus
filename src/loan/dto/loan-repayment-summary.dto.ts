import { ApiProperty } from '@nestjs/swagger';

export class LoanRepaymentSummaryDto {
  @ApiProperty({ description: '총 상환금' })
  totalRepaymentAmount: number;

  @ApiProperty({ description: '총 이자' })
  totalInterestAmount: number;

  @ApiProperty({ description: '월 평균 상환금' })
  averageMonthlyPayment: number;

  @ApiProperty({ description: '남은 원금' })
  remainingPrincipal: number;

  @ApiProperty({ description: '남은 이자' })
  remainingInterest: number;

  @ApiProperty({ description: '다음 상환일' })
  nextPaymentDate: Date;

  @ApiProperty({ description: '상환 진행률 (%)' })
  repaymentProgress: number;

  @ApiProperty({ description: '이자 비율 (%)' })
  interestRatio: number;

  @ApiProperty({ description: '원금 비율 (%)' })
  principalRatio: number;

  @ApiProperty({ description: '완료된 상환 건수' })
  completedPayments: number;

  @ApiProperty({ description: '전체 상환 건수' })
  totalPayments: number;

  @ApiProperty({ description: '연체 건수' })
  overduePayments: number;

  @ApiProperty({ description: '중도상환 총액' })
  totalPrepaymentAmount: number;

  @ApiProperty({ description: '중도상환 시 절약되는 이자' })
  prepaymentInterestSavings: number;
}

export class MonthlyRepaymentSummary {
  @ApiProperty({ description: '상환 번호' })
  paymentNumber: number;

  @ApiProperty({ description: '상환 예정일' })
  paymentDate: Date;

  @ApiProperty({ description: '원금' })
  principal: number;

  @ApiProperty({ description: '이자' })
  interest: number;

  @ApiProperty({ description: '총 상환금' })
  totalPayment: number;

  @ApiProperty({ description: '남은 원금' })
  remainingPrincipal: number;

  @ApiProperty({ description: '상환 상태' })
  status: string;

  @ApiProperty({ description: '실제 상환일' })
  actualPaymentDate?: Date;

  @ApiProperty({ description: '실제 상환금' })
  actualPaymentAmount?: number;
}
