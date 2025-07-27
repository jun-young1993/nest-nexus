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

@ObjectType()
@Entity('user_point_balances')
@Index(['userId'], { unique: true })
export class UserPointBalance {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  currentPoints: number; // 현재 포인트

  @Field()
  @Column({ type: 'int', default: 0 })
  totalEarnedPoints: number; // 총 획득 포인트

  @Field()
  @Column({ type: 'int', default: 0 })
  totalSpentPoints: number; // 총 사용 포인트

  @Field()
  @Column({ type: 'int', default: 0 })
  totalWithdrawnPoints: number; // 총 출금 포인트

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
