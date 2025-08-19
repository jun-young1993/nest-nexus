import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Field, Float, Int } from '@nestjs/graphql';
import { RepaymentType } from '../entities/loan.entity';

export class CreateLoanDto {
  @Field()
  @ApiProperty({ description: '대출명', example: '주택담보대출' })
  @IsString()
  name: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({
    description: '대출 설명',
    example: '주택 구매를 위한 담보대출',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @ApiProperty({ description: '대출 금액', example: 50000000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => Float)
  @ApiProperty({ description: '이자율 (%)', example: 3.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @Field(() => Int)
  @ApiProperty({ description: '대출 기간 (개월)', example: 360 })
  @IsNumber()
  @Min(1)
  @Max(360 * 10)
  term: number;

  @Field()
  @ApiProperty({
    description: '상환 방식',
    enum: RepaymentType,
    example: RepaymentType.EQUAL_INSTALLMENT,
  })
  @IsEnum(RepaymentType)
  repaymentType: RepaymentType;

  @Field()
  @ApiProperty({ description: '대출 시작일', example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '납부일 (1-31)', example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  paymentDay?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '초기 납부금', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialPayment?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '우대 이자율 (%)', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  preferentialRate?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '우대 사유', example: '신용등급 우수' })
  @IsOptional()
  @IsString()
  preferentialReason?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '활성 상태', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field()
  @ApiProperty({
    description: '사용자 ID',
    example: 'eb8ca10c-6ab4-4e82-8c7a-791b5549cb52',
  })
  @IsString()
  userId: string;
}
