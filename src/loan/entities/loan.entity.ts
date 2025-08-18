import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { PaymentSchedule } from './payment-schedule.entity';
import { Prepayment } from './prepayment.entity';
import { LoanAnalytics } from './loan-analytics.entity';

/**
 * 대출 상환 방식 열거형
 */
export enum RepaymentType {
  EQUAL_INSTALLMENT = 'EQUAL_INSTALLMENT', // 원리금균등상환: 매월 원금과 이자를 합한 금액이 동일
  EQUAL_PRINCIPAL = 'EQUAL_PRINCIPAL', // 원금균등상환: 매월 원금은 동일하고 이자는 줄어듦
  BULLET_PAYMENT = 'BULLET_PAYMENT', // 만기일시상환: 만기까지 이자만 납부하고 원금은 만기에 일시 상환
}

/**
 * 대출 상태 열거형
 */
export enum LoanStatus {
  ACTIVE = 'ACTIVE', // 활성: 정상적으로 상환 중
  COMPLETED = 'COMPLETED', // 완료: 모든 상환이 완료됨
  DEFAULTED = 'DEFAULTED', // 연체: 상환 기한을 넘어서 상환이 지연됨
  CANCELLED = 'CANCELLED', // 취소: 대출이 취소됨
}

/**
 * 대출 정보를 관리하는 엔티티
 * 사용자의 대출 계약 정보, 상환 계획, 진행 상황을 추적합니다.
 */
@ObjectType()
@Entity('loans')
@Index(['userId'])
@Index(['status'])
@Index(['startDate'])
export class Loan {
  /**
   * 대출 고유 식별자 (UUID)
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 대출 상품명 또는 대출 목적
   * 예: "주택담보대출", "신용대출", "사업자대출"
   */
  @Field()
  @Column({ length: 100 })
  name: string;

  /**
   * 대출에 대한 추가 설명
   * 예: "신축 아파트 구입을 위한 주택담보대출"
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 대출 원금 (대출 받은 총 금액)
   * 단위: 원 (예: 50000000 = 5천만원)
   * 정밀도: 소수점 2자리까지 (15자리 정수, 2자리 소수)
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  /**
   * 연이율 (연간 이자율)
   * 단위: % (예: 3.5 = 3.5%)
   * 정밀도: 소수점 2자리까지 (5자리 정수, 2자리 소수)
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  /**
   * 대출 기간 (총 상환 개월수)
   * 단위: 개월 (예: 360 = 30년)
   * 일반적으로 12개월(1년) ~ 360개월(30년) 범위
   */
  @Field(() => Int)
  @Column({ type: 'int' })
  term: number;

  /**
   * 상환 방식
   * - EQUAL_INSTALLMENT: 원리금균등상환 (가장 일반적)
   * - EQUAL_PRINCIPAL: 원금균등상환
   * - BULLET_PAYMENT: 만기일시상환
   */
  @Field()
  @Column({ type: 'enum', enum: RepaymentType })
  repaymentType: RepaymentType;

  /**
   * 대출 시작일 (대출금 지급일)
   * 이 날부터 이자 계산이 시작됩니다.
   */
  @Field()
  @Column({ type: 'date' })
  startDate: Date;

  /**
   * 대출 만기일 (최종 상환 예정일)
   * 이 날까지 모든 상환이 완료되어야 합니다.
   */
  @Field()
  @Column({ type: 'date' })
  endDate: Date;

  /**
   * 월 상환일 (매월 상환하는 날짜)
   * 단위: 일 (예: 25 = 매월 25일)
   * null인 경우 startDate의 일자를 기준으로 상환
   */
  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  paymentDay: number;

  /**
   * 초기 상환금 (대출 시작 시 납부하는 첫 상환금)
   * 단위: 원
   * 일반적으로 첫 달 상환금을 미리 납부하는 경우 사용
   */
  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  initialPayment: number;

  /**
   * 우대 이율 (기본 이율에서 할인받는 이율)
   * 단위: % (예: 0.5 = 0.5% 할인)
   * 우대 조건: 급여이체, 자동이체, VIP고객 등
   */
  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  preferentialRate: number;

  /**
   * 우대 이율 적용 사유
   * 예: "급여이체", "자동이체", "VIP고객", "신규고객 우대"
   */
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  preferentialReason: string;

  /**
   * 대출 활성 상태
   * true: 활성 대출, false: 비활성 대출
   * 취소되거나 완료된 대출은 false로 설정
   */
  @Field()
  @Column({ default: true })
  isActive: boolean;

  /**
   * 대출 상태
   * - ACTIVE: 활성 (정상 상환 중)
   * - COMPLETED: 완료 (모든 상환 완료)
   * - DEFAULTED: 연체 (상환 지연)
   * - CANCELLED: 취소 (대출 취소)
   */
  @Field()
  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  /**
   * 총 상환 완료 금액 (원금 + 이자)
   * 단위: 원
   * 매월 상환할 때마다 누적되어 증가
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaidAmount: number;

  /**
   * 총 상환 완료 이자 금액
   * 단위: 원
   * 매월 이자 상환 시마다 누적되어 증가
   */
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaidInterest: number;

  /**
   * 완료된 상환 횟수
   * 단위: 회
   * 매월 상환 시마다 1씩 증가
   * 최대값은 term과 동일
   */
  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  completedPayments: number;

  /**
   * 대출 계약 생성일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 대출 정보 최종 수정일
   * 시스템에서 자동으로 설정
   */
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 대출 삭제일 (소프트 삭제)
   * 실제 데이터는 유지하되 삭제된 것으로 표시
   */
  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 외래 키
  /**
   * 대출자 사용자 ID
   * User 엔티티와 연결되는 외래 키
   */
  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  // 관계
  /**
   * 대출자 정보
   * Many-to-One 관계: 한 사용자가 여러 대출을 가질 수 있음
   */
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * 상환 계획표 목록
   * One-to-Many 관계: 하나의 대출에 여러 개의 상환 계획이 있음
   * 매월 상환해야 할 금액과 일정을 관리
   */
  @Field(() => [PaymentSchedule])
  @OneToMany(() => PaymentSchedule, (schedule) => schedule.loan)
  paymentSchedules: PaymentSchedule[];

  /**
   * 중도상환 내역 목록
   * One-to-Many 관계: 하나의 대출에 여러 번의 중도상환이 있을 수 있음
   * 만기 전 원금 일부를 미리 상환하는 경우
   */
  @Field(() => [Prepayment])
  @OneToMany(() => Prepayment, (prepayment) => prepayment.loan)
  prepayments: Prepayment[];

  /**
   * 대출 분석 데이터 목록
   * One-to-Many 관계: 하나의 대출에 여러 시점의 분석 데이터가 있음
   * 상환 진행률, 이자 부담률 등 분석 정보
   */
  @Field(() => [LoanAnalytics])
  @OneToMany(() => LoanAnalytics, (analytics) => analytics.loan)
  analytics: LoanAnalytics[];

  // 계산된 필드 (가상 컬럼)
  /**
   * 남은 원금 (미상환 원금)
   * 계산식: amount - totalPaidAmount
   * 단위: 원
   */
  @Field(() => Float)
  get remainingBalance(): number {
    return this.amount - this.totalPaidAmount;
  }

  /**
   * 남은 상환 횟수
   * 계산식: term * 12 - completedPayments
   * 단위: 회
   * term은 연 단위이므로 12를 곱해서 월 단위로 변환
   */
  @Field(() => Int)
  get remainingPayments(): number {
    return this.term * 12 - this.completedPayments;
  }
}
