import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NoticeReportType } from 'src/notice/enum/notice-report-type.enum';

export class CreateS3ObjectReportDto {
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
}
