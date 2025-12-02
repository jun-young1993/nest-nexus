import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AwsS3AppNames } from 'src/config/config.type';

export class MigrateCreateLowResAndThumbnailQueryDto {
  @ApiProperty({
    description: 'Application name for the migrated objects',
    enum: ['baby-log', 'young-young-family-assets'],
    example: 'baby-log',
  })
  @IsIn(['baby-log', 'young-young-family-assets'])
  appName: AwsS3AppNames;
}
