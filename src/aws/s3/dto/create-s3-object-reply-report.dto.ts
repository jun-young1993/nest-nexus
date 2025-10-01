import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NoticeReportType } from 'src/notice/enum/notice-report-type.enum';

export class CreateS3ObjectReplyReportDto {
  @ApiProperty({
    description: '신고 유형',
    enum: NoticeReportType,
    default: NoticeReportType.ETC,
  })
  @IsEnum(NoticeReportType)
  @IsNotEmpty()
  type: NoticeReportType;

  @ApiProperty({
    description: '신고 내용',
    example: '부적절한 콘텐츠가 포함되어 있습니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: '신고자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  reporterId: string;

  @ApiProperty({
    description: '신고할 S3ObjectReply ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  s3ObjectReplyId: string;
}

