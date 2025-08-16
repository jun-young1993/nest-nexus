import { IsString, IsNumber, IsDate, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Field, Float, Int } from '@nestjs/graphql';
import { PaymentStatus } from '../entities/payment-schedule.entity';

export class CreatePaymentScheduleDto {
  @Field(() => Int)
  @ApiProperty({ description: '납부 번호', example: 1 })
  @IsNumber()
  @Min(1)
  paymentNumber: number;

  @Field()
  @ApiProperty({ description: '납부일', example: '2024-02-15' })
  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @Field(() => Float)
  @ApiProperty({ description: '원금', example: 200000 })
  @IsNumber()
  @Min(0)
  principalAmount: number;

  @Field(() => Float)
  @ApiProperty({ description: '이자', example: 150000 })
  @IsNumber()
  @Min(0)
  interestAmount: number;

  @Field(() => Float)
  @ApiProperty({ description: '총 납부금', example: 350000 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Field(() => Float)
  @ApiProperty({ description: '잔액', example: 48000000 })
  @IsNumber()
  @Min(0)
  remainingBalance: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '납부 상태', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '실제 납부금', example: 350000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualPaidAmount?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '연체료', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFee?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '비고', example: '정상 납부' })
  @IsOptional()
  @IsString()
  notes?: string;
}
