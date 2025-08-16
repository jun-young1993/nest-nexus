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
import { Prepayment } from './prepayment.entity';

@ObjectType()
@Entity('prepayment_schedules')
@Index(['prepaymentId'])
@Index(['originalScheduleId'])
export class PrepaymentSchedule {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  originalScheduleNumber: number;

  @Field()
  @Column({ type: 'date' })
  originalPaymentDate: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  originalPrincipalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  originalInterestAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  originalTotalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustedPrincipalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustedInterestAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustedTotalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalReduction: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  interestReduction: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalReduction: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // 외래 키
  @Field()
  @Column({ type: 'uuid' })
  prepaymentId: string;

  @Field()
  @Column({ type: 'uuid' })
  originalScheduleId: string;

  // 관계
  @Field(() => Prepayment)
  @ManyToOne(() => Prepayment, prepayment => prepayment.schedules)
  @JoinColumn({ name: 'prepaymentId' })
  prepayment: Prepayment;
}
