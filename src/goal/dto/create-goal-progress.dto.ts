import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoalProgressDto {
  @ApiProperty({ description: '목표 진행 날짜' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: '목표 진행 완료 여부', default: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ description: '목표 진행 랭크', default: 0 })
  @IsInt()
  @IsOptional()
  rank?: number;

  @ApiProperty({ description: '목표 진행 제목', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '목표 진행 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
