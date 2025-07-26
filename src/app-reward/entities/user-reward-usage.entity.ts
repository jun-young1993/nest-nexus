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
import { RewardType } from './reward-config.entity';

@ObjectType()
@Entity('user_reward_usages')
@Index(['userId', 'rewardType', 'createdAt'])
@Index(['userId', 'date'])
export class UserRewardUsage {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: RewardType,
  })
  rewardType: RewardType;

  @Field()
  @Column({ type: 'date' })
  date: Date; // 사용 날짜 (YYYY-MM-DD)

  @Field()
  @Column({ type: 'int', default: 0 })
  usageCount: number; // 사용 횟수

  @Field()
  @Column({ type: 'bigint', default: 0 })
  totalPointsEarned: number; // 해당 날짜에 획득한 총 포인트

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