import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { PaymentSchedule } from './payment-schedule.entity';
import { Prepayment } from './prepayment.entity';
import { LoanAnalytics } from './loan-analytics.entity';

export enum RepaymentType {
  EQUAL_INSTALLMENT = 'EQUAL_INSTALLMENT', // 원리금균등상환
  EQUAL_PRINCIPAL = 'EQUAL_PRINCIPAL', // 원금균등상환
  BULLET_PAYMENT = 'BULLET_PAYMENT', // 만기일시상환
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE', // 활성
  COMPLETED = 'COMPLETED', // 완료
  DEFAULTED = 'DEFAULTED', // 연체
  CANCELLED = 'CANCELLED', // 취소
}

@ObjectType()
@Entity('loans')
@Index(['userId'])
@Index(['status'])
@Index(['startDate'])
export class Loan {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  term: number;

  @Field()
  @Column({ type: 'enum', enum: RepaymentType })
  repaymentType: RepaymentType;

  @Field()
  @Column({ type: 'date' })
  startDate: Date;

  @Field()
  @Column({ type: 'date' })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  paymentDay: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  initialPayment: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  preferentialRate: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  preferentialReason: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaidAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaidInterest: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  completedPayments: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 외래 키
  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  // 관계
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [PaymentSchedule])
  @OneToMany(() => PaymentSchedule, (schedule) => schedule.loan)
  paymentSchedules: PaymentSchedule[];

  @Field(() => [Prepayment])
  @OneToMany(() => Prepayment, (prepayment) => prepayment.loan)
  prepayments: Prepayment[];

  @Field(() => [LoanAnalytics])
  @OneToMany(() => LoanAnalytics, (analytics) => analytics.loan)
  analytics: LoanAnalytics[];

  // 계산된 필드 (가상 컬럼)
  @Field(() => Float)
  get remainingBalance(): number {
    return this.amount - this.totalPaidAmount;
  }

  @Field(() => Int)
  get remainingPayments(): number {
    return this.term * 12 - this.completedPayments;
  }
}
