import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int } from '@nestjs/graphql';
import { Loan } from './loan.entity';

@ObjectType()
class PaymentHistoryItem {
  @Field()
  date: string;

  @Field(() => Float)
  amount: number;

  @Field()
  type: string;
}

@ObjectType()
class InterestBreakdownItem {
  @Field(() => Int)
  month: number;

  @Field(() => Float)
  principal: number;

  @Field(() => Float)
  interest: number;

  @Field(() => Float)
  balance: number;
}

@ObjectType()
@Entity('loan_analytics')
@Index(['loanId'])
@Index(['analysisDate'])
export class LoanAnalytics {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'date' })
  analysisDate: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalInterestPaid: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrincipalPaid: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  effectiveInterestRate: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  remainingPayments: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthlyPayment: number;

  @Field(() => [PaymentHistoryItem])
  @Column({ type: 'json' })
  paymentHistory: PaymentHistoryItem[];

  @Field(() => [InterestBreakdownItem])
  @Column({ type: 'json' })
  interestBreakdown: InterestBreakdownItem[];

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  prepaymentSavings: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // 외래 키
  @Field()
  @Column({ type: 'uuid' })
  loanId: string;

  // 관계
  @Field(() => Loan)
  @ManyToOne(() => Loan, loan => loan.analytics)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;
}
