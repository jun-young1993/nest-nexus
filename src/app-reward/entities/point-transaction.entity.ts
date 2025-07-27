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
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

export enum TransactionType {
  EARN = 'earn', // 획득
  SPEND = 'spend', // 사용
  WITHDRAW = 'withdraw', // 출금
  REFUND = 'refund', // 환불
  BONUS = 'bonus', // 보너스
}

export enum TransactionSource {
  ADMOB_REWARD = 'admob_reward',
  OFFERWALL = 'offerwall',
  DAILY_BONUS = 'daily_bonus',
  REFERRAL = 'referral',
  PURCHASE = 'purchase',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
}

@ObjectType()
@Entity('point_transactions')
@Index(['userId', 'createdAt'])
@Index(['transactionType'])
@Index(['source'])
export class PointTransaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Field()
  @Column({
    type: 'enum',
    enum: TransactionSource,
  })
  source: TransactionSource;

  @Field()
  @Column({ type: 'int' })
  amount: number; // 거래 금액 (양수: 획득, 음수: 사용)

  @Field()
  @Column({ type: 'int' })
  balanceBefore: number; // 거래 전 잔액

  @Field()
  @Column({ type: 'int' })
  balanceAfter: number; // 거래 후 잔액

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string; // 거래 설명

  @Field({ nullable: true })
  @Column({ nullable: true })
  referenceId?: string; // 참조 ID (광고 ID, 주문 ID 등)

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadata?: string; // 추가 메타데이터 (JSON)

  @Field()
  @Column({ default: true })
  isActive: boolean; // 활성 상태

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
