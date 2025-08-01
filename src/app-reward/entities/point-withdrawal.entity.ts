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

export enum WithdrawalStatus {
  PENDING = 'pending', // 송금 대기
  COMPLETED = 'completed', // 송금 완료
  REJECTED = 'rejected', // 거절
}

@ObjectType()
@Entity('point_withdrawals')
export class PointWithdrawal {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userPointBalanceId: string; // user_point_balance.id와 매핑

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  bankName: string; // 은행명

  @Field()
  @Column()
  accountNumber: string; // 계좌번호

  @Field()
  @Column()
  accountHolder: string; // 예금주

  @Field()
  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus; // 상태: 송금 대기, 송금 완료

  @Field()
  @Column({ type: 'int' })
  withdrawalAmount: number; // 송금액 (포인트)

  @Field()
  @Column({ type: 'int', default: 0 })
  completedAmount: number; // 실제 송금 완료된 금액

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
