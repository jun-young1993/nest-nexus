import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum StorageLimitType {
  S3_STORAGE = 'S3_STORAGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DAILY_UPLOAD = 'DAILY_UPLOAD',
  MONTHLY_UPLOAD = 'MONTHLY_UPLOAD',
}

@Entity('user_storage_limits')
export class UserStorageLimit {
  @ApiProperty({
    description: '스토리지 제한 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: '제한 타입',
    enum: StorageLimitType,
    example: StorageLimitType.S3_STORAGE,
  })
  @Column({
    type: 'enum',
    enum: StorageLimitType,
  })
  limitType: StorageLimitType;

  @ApiProperty({
    description: '제한값 (바이트 단위)',
    example: 1073741824, // 1GB
  })
  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  limitValue: number;

  @ApiProperty({
    description: '현재 사용량 (바이트 단위)',
    example: 524288000, // 500MB
    default: 0,
  })
  @Column({
    type: 'bigint',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  currentUsage: number;

  @ApiProperty({
    description: '제한 활성화 여부',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '제한 만료일 (null이면 무제한)',
    example: '2025-12-31T23:59:59.999Z',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ApiProperty({
    description: '제한 설명',
    example: 'S3 스토리지 총 용량 제한',
    nullable: true,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: '생성일시',
    example: '2025-09-24T02:28:18.329Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2025-09-24T02:28:18.329Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.storageLimits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // 계산된 속성들
  @ApiProperty({
    description: '사용률 (0-100)',
    example: 48.8,
  })
  get usagePercentage(): number {
    if (this.limitValue === 0) return 0;
    return Math.round((this.currentUsage / this.limitValue) * 100 * 100) / 100;
  }

  @ApiProperty({
    description: '남은 용량 (바이트)',
    example: 549755813888,
  })
  get remainingSpace(): number {
    return Math.max(0, this.limitValue - this.currentUsage);
  }

  @ApiProperty({
    description: '제한 초과 여부',
    example: false,
  })
  get isOverLimit(): boolean {
    return this.currentUsage > this.limitValue;
  }

  @ApiProperty({
    description: '제한 만료 여부',
    example: false,
  })
  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  addFileSize(fileSize: number): void {
    this.currentUsage += fileSize;
    if (this.currentUsage > this.limitValue) {
      throw new Error('스토리지 용량을 초과합니다.');
    }
  }

  decreaseFileSize(fileSize: number): void {
    this.currentUsage -= fileSize;
    if (this.currentUsage < 0) {
      this.currentUsage = 0;
    }
  }
}
