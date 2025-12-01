import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AwsRegion } from '../enums/aws-region.enums';

export class ListObjectsQueryDto {
  @ApiProperty({
    description: 'AWS S3 bucket name',
    example: 'my-bucket',
  })
  @IsString()
  bucket: string;

  @ApiProperty({
    description: 'AWS region of the bucket',
    enum: AwsRegion,
    example: AwsRegion.AP_NORTHEAST_2,
  })
  @IsEnum(AwsRegion)
  region: AwsRegion;

  @ApiPropertyOptional({
    description:
      'Folder path (prefix). Use trailing slash for folders, e.g. "photos/2025/".',
    example: 'photos/2025/',
  })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({
    description: 'Pagination token from previous response',
  })
  @IsOptional()
  @IsString()
  continuationToken?: string;

  @ApiPropertyOptional({
    description: 'Page size (max keys per request)',
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  pageSize?: number;
}


