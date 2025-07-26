import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

export enum RewardType {
  ADMOB_REWARD = 'admob_reward',
  OFFERWALL = 'offerwall',
  DAILY_BONUS = 'daily_bonus',
  REFERRAL = 'referral',
  PURCHASE = 'purchase',
}

@ObjectType()
@Entity('reward_configs')
export class RewardConfig {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({
    type: 'enum',
    enum: RewardType,
  })
  rewardType: RewardType;

  @Field()
  @Column()
  name: string; // 리워드 이름

  @Field()
  @Column({ type: 'int' })
  pointsPerReward: number; // 리워드당 포인트

  @Field()
  @Column({ type: 'int', default: 0 })
  dailyLimit: number; // 일일 제한 (0: 무제한)

  @Field()
  @Column({ type: 'int', default: 0 })
  cooldownMinutes: number; // 쿨다운 시간 (분)

  @Field()
  @Column({ default: true })
  isActive: boolean; // 활성 상태

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string; // 설명

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadata?: string; // 추가 설정 (JSON)

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 