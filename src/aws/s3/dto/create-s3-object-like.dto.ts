import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class CreateS3ObjectLikeDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'S3 객체 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  s3ObjectId: string;

  static fromJson(json: any): CreateS3ObjectLikeDto {
    return plainToInstance(CreateS3ObjectLikeDto, json);
  }
}
