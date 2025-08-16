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
import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { Loan } from './loan.entity';
import { PrepaymentSchedule } from './prepayment-schedule.entity';

export enum PrepaymentType {
  PARTIAL = 'PARTIAL',         // 부분상환
  FULL = 'FULL'                // 전액상환
}

export enum PrepaymentStatus {
  PENDING = 'PENDING',         // 대기
  APPLIED = 'APPLIED',         // 적용됨
  CANCELLED = 'CANCELLED',     // 취소됨
  REJECTED = 'REJECTED'        // 거부됨
}

@ObjectType()
@Entity('prepayments')
@Index(['loanId'])
@Index(['status'])
@Index(['prepaymentDate'])
export class Prepayment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Field()
  @Column({ type: 'enum', enum: PrepaymentType })
  type: PrepaymentType;

  @Field()
  @Column({ type: 'date' })
  prepaymentDate: Date;

  @Field()
  @Column({ type: 'enum', enum: PrepaymentStatus, default: PrepaymentStatus.PENDING })
  status: PrepaymentStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  reason: string;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestSavings: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  principalReduction: number;

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
  @ManyToOne(() => Loan, loan => loan.prepayments)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Field(() => [PrepaymentSchedule])
  @OneToMany(() => PrepaymentSchedule, schedule => schedule.prepayment)
  schedules: PrepaymentSchedule[];
}
