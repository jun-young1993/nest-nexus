import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AwsRegion } from '../enums/aws-region.enums';
import { AwsS3AppNames, AwsS3AppNamesValues } from 'src/config/config.type';

export class ListObjectsQueryDto {
  @ApiProperty({
    description: 'AWS S3 bucket name',
    example: 'my-bucket',
  })
  @IsString()
  bucket: string;

  @ApiProperty({
    description: 'Application name for the migrated objects',
    enum: ['baby-log', 'young-young-family-assets'],
    example: 'baby-log',
  })
  @IsIn(AwsS3AppNamesValues)
  appName: AwsS3AppNames;

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
