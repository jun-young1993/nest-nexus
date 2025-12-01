import { ApiProperty } from '@nestjs/swagger';

export class S3ObjectItemDto {
  @ApiProperty({ description: 'Object key', example: 'photos/2025/01/image.jpg' })
  key: string;

  @ApiProperty({ description: 'Object size in bytes', example: 123456 })
  size: number;

  @ApiProperty({
    description: 'Last modified timestamp',
    example: '2025-01-01T12:34:56.000Z',
  })
  lastModified: Date;

  @ApiProperty({
    description: 'S3 storage class',
    example: 'STANDARD',
  })
  storageClass: string;
}

export class ListObjectsResponseDto {
  @ApiProperty({ type: [S3ObjectItemDto] })
  items: S3ObjectItemDto[];

  @ApiProperty({
    description:
      'Next continuation token for pagination. If null, there are no more pages.',
    nullable: true,
  })
  nextContinuationToken: string | null;
}


