import { ApiProperty } from '@nestjs/swagger';

export class MigrateBucketResponseDto {
  @ApiProperty({
    description: 'Total number of objects found in the bucket',
    example: 150,
  })
  totalObjects: number;

  @ApiProperty({
    description: 'Number of objects that were already in the database',
    example: 100,
  })
  existingObjects: number;

  @ApiProperty({
    description: 'Number of new objects migrated to the database',
    example: 50,
  })
  migratedObjects: number;

  @ApiProperty({
    description: 'Number of objects that failed to migrate',
    example: 0,
  })
  failedObjects: number;
}

