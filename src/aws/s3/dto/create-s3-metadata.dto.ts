import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { S3Object } from '../entities/s3-object.entity';

export class CreateS3MetadataDto {
  @IsOptional()
  @ApiProperty({
    description: 'S3 객체 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  caption: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'S3 객체',
    example: 'S3 객체',
  })
  @ValidateNested()
  @Type(() => S3Object)
  s3Object: S3Object;

  static fromJson(json: any): CreateS3MetadataDto {
    return plainToInstance(CreateS3MetadataDto, json);
  }
}
