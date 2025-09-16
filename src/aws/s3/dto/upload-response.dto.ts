import { ApiProperty } from '@nestjs/swagger';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadResponseDto {
  @Field()
  @ApiProperty({
    description: '업로드된 파일의 URL',
    example:
      'https://juny-babylog-bucket.s3.us-east-1.amazonaws.com/1234567890-image.jpg',
  })
  url: string;

  @Field()
  @ApiProperty({
    description: '업로드된 파일의 키',
    example: '1234567890-image.jpg',
  })
  key: string;

  @Field()
  @ApiProperty({
    description: '원본 파일명',
    example: 'image.jpg',
  })
  originalName: string;

  @Field()
  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
  })
  size: number;

  @Field()
  @ApiProperty({
    description: '파일 MIME 타입',
    example: 'image/jpeg',
  })
  mimetype: string;

  @Field()
  @ApiProperty({
    description: '업로드 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  uploadedAt: Date;

  @Field({ nullable: true })
  @ApiProperty({
    description: 'S3 리전',
    example: 'us-west-2',
    required: false,
  })
  region?: string;
}
