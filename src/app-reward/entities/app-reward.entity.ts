import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity('app_rewards')
export class AppReward {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  appId: string;

  @Field()
  @Column()
  rewardType: string; // 'admob', 'offerwall', etc.

  @Field()
  @Column({ type: 'int' })
  amount: number; // 포인트 수량

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string; // 적립 사유

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
