import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionSource } from '../entities/point-transaction.entity';

export class ProcessRewardDto {
  @ApiProperty({ description: '사용자 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '리워드 소스', enum: TransactionSource })
  @IsEnum(TransactionSource)
  source: TransactionSource;

  @ApiProperty({ description: '참조 ID', required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({ description: '메타데이터', required: false })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiProperty({ description: '앱 ID' })
  @IsString()
  appId: string;

  @ApiProperty({ description: '리워드 네임' })
  @IsString()
  rewardName: string;
}
