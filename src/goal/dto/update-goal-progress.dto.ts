import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateGoalProgressDto {
  @ApiProperty({ description: '목표 진행 완료 여부', required: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ description: '목표 진행 랭크', required: false })
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