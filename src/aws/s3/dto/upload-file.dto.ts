import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field } from '@nestjs/graphql';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export class UploadFileDto {
  @Field({ nullable: true })
  @ApiPropertyOptional({
    description: '파일 타입',
    enum: FileType,
    example: FileType.IMAGE,
  })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @Field({ nullable: true })
  @ApiPropertyOptional({
    description: '파일 설명',
    example: '프로필 이미지',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({
    description: '파일 폴더 경로',
    example: 'users/profile',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
