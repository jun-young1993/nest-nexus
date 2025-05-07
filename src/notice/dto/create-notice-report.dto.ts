import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NoticeReportType } from '../enum/notice-report-type.enum';

export class CreateNoticeReportDto {
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
    example: '잘못된 정보가 포함되어 있습니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '신고자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  reporterId: string;

  @ApiProperty({
    description: '신고할 공지사항 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  noticeId: string;
}
