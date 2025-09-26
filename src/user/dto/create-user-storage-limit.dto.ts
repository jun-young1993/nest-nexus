import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { StorageLimitType } from '../entities/user-storage-limit.entity';

export class CreateUserStorageLimitDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '제한 타입',
    enum: StorageLimitType,
    example: StorageLimitType.S3_STORAGE,
  })
  @IsEnum(StorageLimitType)
  limitType: StorageLimitType;

  @ApiProperty({
    description: '제한값 (바이트 단위)',
    example: 1073741824, // 1GB
  })
  @IsNumber()
  limitValue: number;

  @ApiProperty({
    description: '제한 활성화 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: '제한 만료일',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: '제한 설명',
    example: 'S3 스토리지 총 용량 제한',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
