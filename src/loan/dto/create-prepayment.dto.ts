import { IsString, IsNumber, IsDate, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Field, Float } from '@nestjs/graphql';
import { PrepaymentType } from '../entities/prepayment.entity';

export class CreatePrepaymentDto {
  @Field(() => Float)
  @ApiProperty({ description: '중도상환 금액', example: 5000000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @Field()
  @ApiProperty({ description: '중도상환 유형', enum: PrepaymentType, example: PrepaymentType.PARTIAL })
  @IsEnum(PrepaymentType)
  type: PrepaymentType;

  @Field()
  @ApiProperty({ description: '중도상환일', example: '2024-06-15' })
  @Type(() => Date)
  @IsDate()
  prepaymentDate: Date;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '중도상환 사유', example: '이자 절약을 위한 부분 상환' })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '이자 절약액', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestSavings?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '원금 감액', example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  principalReduction?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: '비고', example: '정상 중도상환' })
  @IsOptional()
  @IsString()
  notes?: string;
}
