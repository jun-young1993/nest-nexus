import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionType,
  TransactionSource,
} from '../entities/point-transaction.entity';

export class CreatePointTransactionDto {
  @ApiProperty({ description: '사용자 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '거래 타입', enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ description: '거래 소스', enum: TransactionSource })
  @IsEnum(TransactionSource)
  source: TransactionSource;

  @ApiProperty({ description: '거래 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '거래 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '참조 ID', required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({ description: '메타데이터', required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}
