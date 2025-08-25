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
import { Loan } from './loan.entity';

/**
 * 상환 상태 열거형
 */
export enum PaymentStatus {
  PENDING = 'PENDING', // 대기: 아직 상환 예정인 상태
  PAID = 'PAID', // 납부완료: 정상적으로 상환이 완료된 상태
  PARTIAL = 'PARTIAL', // 부분납부: 일부만 상환된 상태
  OVERDUE = 'OVERDUE', // 연체: 상환 기한을 넘어서 지연된 상태
  CANCELLED = 'CANCELLED', // 취소: 상환이 취소된 상태
}

/**
 * 대출 상환 계획표 엔티티
 * 대출의 월별 상환 계획을 관리하며, 각 월의 원금, 이자, 총 상환금액을 계산합니다.
 */
@ObjectType()
@Entity('payment_schedules')
@Index(['loanId'])
@Index(['status'])
@Index(['paymentDate'])
export class PaymentSchedule {
  /**
   * 상환 계획 고유 식별자 (UUID)
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 상환 회차 (몇 번째 상환인지)
   * 단위: 회 (예: 1 = 첫 번째 상환, 12 = 12번째 상환)
   * 대출 시작일부터 순차적으로 증가
   */
  @Field(() => Int)
  @Column({ type: 'int' })
  paymentNumber: number;

  /**
   * 상환 예정일
   * 대출 시작일 기준으로 매월 동일한 날짜
   * 예: 대출 시작일이 2024-01-15이면 매월 15일
   */
  @Field()
  @Column({ type: 'date' })
  paymentDate: Date;

  /**
   * 원금 상환 금액
   * 단위: 원
   * 해당 월에 상환해야 할 원금의 일부
   * 상환 방식에 따라 매월 동일하거나 달라질 수 있음
   */
  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  principalAmount: number;

  /**
   * 이자 상환 금액
   * 단위: 원
   * 해당 월에 납부해야 할 이자
   * 남은 원금을 기준으로 계산되므로 매월 달라질 수 있음
   */
  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  interestAmount: number;

  /**
   * 총 상환 금액 (원금 + 이자)
   * 단위: 원
   * 해당 월에 실제로 납부해야 할 총 금액
   * 원리금균등상환의 경우 매월 동일
   */
  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  /**
   * 상환 후 남은 원금
   * 단위: 원
   * 해당 월 상환 완료 후 남은 원금
   * 매월 원금 상환 금액만큼 감소
   */
  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  remainingBalance: number;

  /**
   * 상환 상태
   * - PENDING: 대기 (아직 상환 예정)
   * - PAID: 납부완료 (정상 상환 완료)
   * - PARTIAL: 부분납부 (일부만 상환)
   * - OVERDUE: 연체 (상환 지연)
   * - CANCELLED: 취소 (상환 취소)
   */
  @Field()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  /**
   * 실제 상환 완료일
   * 실제로 상환이 완료된 날짜와 시간
   * null인 경우 아직 상환되지 않음
   */
  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  /**
   * 실제 상환된 금액
   * 단위: 원
   * 계획된 금액과 다를 수 있음 (부분납부, 추가납부 등)
   * 기본값: 0 (아직 상환되지 않음)
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualPaidAmount: number;

  /**
   * 연체료
   * 단위: 원
   * 상환 기한을 넘어서 납부할 경우 발생하는 추가 비용
   * 기본값: 0 (연체되지 않음)
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lateFee: number;

  /**
   * 상환 관련 메모
   * 상환 지연 사유, 특별한 상황 등에 대한 기록
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 상환 계획 생성일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 상환 계획 최종 수정일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // 외래 키
  /**
   * 대출 ID
   * Loan 엔티티와 연결되는 외래 키
   */
  @Field()
  @Column({ type: 'uuid' })
  loanId: string;

  // 관계
  /**
   * 대출 정보
   * Many-to-One 관계: 하나의 대출에 여러 개의 상환 계획이 있음
   */
  @Field(() => Loan)
  @ManyToOne(() => Loan, (loan) => loan.paymentSchedules)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;
}
