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

export enum PaymentStatus {
  PENDING = 'PENDING',         // 대기
  PAID = 'PAID',               // 납부완료
  PARTIAL = 'PARTIAL',         // 부분납부
  OVERDUE = 'OVERDUE',         // 연체
  CANCELLED = 'CANCELLED'      // 취소
}

@ObjectType()
@Entity('payment_schedules')
@Index(['loanId'])
@Index(['status'])
@Index(['paymentDate'])
export class PaymentSchedule {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  paymentNumber: number;

  @Field()
  @Column({ type: 'date' })
  paymentDate: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  interestAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: number;

  @Field()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualPaidAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lateFee: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

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
  @ManyToOne(() => Loan, loan => loan.paymentSchedules)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;
}
