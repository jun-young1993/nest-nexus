import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';
import { AwsS3AppNames } from 'src/config/config.type';

export class MigrateCreateLowResAndThumbnailQueryDto {
  @ApiProperty({
    description: 'Application name for the migrated objects',
    enum: ['baby-log', 'young-young-family-assets'],
    example: 'baby-log',
  })
  @IsIn(['baby-log', 'young-young-family-assets'])
  appName: AwsS3AppNames;

  @ApiProperty({
    description: 'Limit the number of objects to migrate',
    example: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
