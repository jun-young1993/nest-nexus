import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

/**
 * 사용자 블록 상태 열거형
 */
export enum BlockStatus {
  ACTIVE = 'ACTIVE', // 활성 블록
  INACTIVE = 'INACTIVE', // 비활성 블록 (해제됨)
}

/**
 * 사용자 블록 엔티티
 * 사용자가 특정 유저를 블록하여 상호작용을 제한합니다.
 */
@ObjectType()
@Entity('user_blocks')
@Index(['blockerId'])
@Index(['blockedId'])
@Index(['status'])
@Index(['createdAt'])
@Unique(['blockerId', 'blockedId']) // 같은 사용자에 대한 중복 블록 방지
export class UserBlock {
  /**
   * 블록 고유 식별자 (UUID)
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 블록을 한 사용자 ID (블로커)
   * 누가 블록했는지
   */
  @Field()
  @Column({ type: 'uuid' })
  blockerId: string;

  /**
   * 블록당한 사용자 ID (블록당한자)
   * 누가 블록당했는지
   */
  @Field()
  @Column({ type: 'uuid' })
  blockedId: string;

  /**
   * 블록 사유
   * 사용자가 입력한 블록 이유
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  /**
   * 블록 상태
   * - ACTIVE: 활성 블록 (현재 블록 상태)
   * - INACTIVE: 비활성 블록 (해제됨)
   */
  @Field()
  @Column({
    type: 'enum',
    enum: BlockStatus,
    default: BlockStatus.ACTIVE,
  })
  status: BlockStatus;

  /**
   * 블록 해제일
   * 블록이 해제된 날짜와 시간
   * null인 경우 아직 블록 상태
   */
  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  unblockedAt?: Date;

  /**
   * 블록 해제 사유
   * 블록을 해제한 이유
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  unblockReason?: string;

  /**
   * 블록 생성일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 블록 정보 최종 수정일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  /**
   * 블록을 한 사용자 정보
   * Many-to-One 관계: 한 사용자가 여러 명을 블록할 수 있음
   */
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockerId' })
  blocker: User;

  /**
   * 블록당한 사용자 정보
   * Many-to-One 관계: 한 사용자가 여러 명에게 블록당할 수 있음
   */
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedId' })
  blocked: User;
}
