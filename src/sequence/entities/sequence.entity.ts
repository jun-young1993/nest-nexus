import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

/**
 * 시퀀스 엔티티
 * 다양한 용도의 시퀀스 번호를 관리합니다.
 */
@ObjectType()
@Entity('sequences')
export class Sequence {
  /**
   * 시퀀스 고유 식별자 (UUID)
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 시퀀스명
   * 예: 'ORDER_NUMBER', 'INVOICE_NUMBER', 'USER_CODE' 등
   */
  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  sequenceName: string;

  /**
   * 현재 시퀀스 번호
   * 다음 번호를 생성할 때 이 값에 1을 더해서 반환
   */
  @Field(() => Int)
  @Column({ type: 'bigint', default: 0 })
  sequenceNumber: number;

  /**
   * 시퀀스 설명
   * 시퀀스의 용도나 설명
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * 시퀀스 접두사
   * 예: 'ORD', 'INV', 'USR' 등
   */
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 10, nullable: true })
  prefix?: string;

  /**
   * 시퀀스 접미사
   * 예: '-2024', '-A' 등
   */
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 10, nullable: true })
  suffix?: string;

  /**
   * 시퀀스 패딩 길이
   * 예: 6이면 000001, 000002 형태로 패딩
   */
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  paddingLength?: number;

  /**
   * 시퀀스 활성화 여부
   * false인 경우 시퀀스 생성이 중단됨
   */
  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * 시퀀스 생성일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 시퀀스 정보 최종 수정일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
