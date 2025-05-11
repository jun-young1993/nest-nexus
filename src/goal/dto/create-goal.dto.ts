import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({
    description: '목표 제목',
    example: '운동',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '목표 설명',
    example: '하루 운동 30분',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '시작일',
    example: '2025-05-11',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: '종료일',
    example: '2025-05-18',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
