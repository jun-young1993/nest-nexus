import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AwsRegion } from '../enums/aws-region.enums';
import { AwsS3AppNames, AwsS3AppNamesValues } from 'src/config/config.type';

export class MigrateBucketQueryDto {
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

  @ApiProperty({
    description: 'Application name for the migrated objects',
    enum: AwsS3AppNamesValues,
    example: 'baby-log',
  })
  @IsIn(AwsS3AppNamesValues)
  appName: AwsS3AppNames;

  @ApiPropertyOptional({
    description:
      'Folder path (prefix) to migrate. If not specified, migrates all objects in the bucket.',
    example: 'photos/2025/',
  })
  @IsOptional()
  @IsString()
  prefix?: string;
}
