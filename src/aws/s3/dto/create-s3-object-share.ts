import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateS3ObjectShareDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: 'S3 객체 ID',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    isArray: true,
    type: [String],
  })
  s3ObjectId: string[];

  @IsOptional()
  @ApiProperty({
    description: '만료 일자',
    example: '2025-12-31',
    required: false,
  })
  expiredAt?: Date;

  @IsOptional()
  @ApiProperty({
    description: '공유 코드',
    example: '1234567890',
  })
  shareCode?: string;

  @IsString()
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: '공유 설명',
    example: '공유 설명',
    required: false,
  })
  description?: string;
}
