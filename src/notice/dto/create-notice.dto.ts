import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NoticeType } from '../enum/notice.type';

export class CreateNoticeDto {
  @IsString()
  @ApiProperty({
    example: 'test notice title',
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'test notice content',
  })
  content: string;

  @IsEnum(NoticeType)
  @IsOptional()
  @ApiProperty({
    example: 'test notice type',
  })
  type?: NoticeType;

  @IsString()
  @ApiProperty({
    example: 'test notice group id',
  })
  noticeGroupId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'test notice user id',
  })
  userName: string;

  @IsString()
  @ApiProperty({
    example: 'notice user id',
  })
  userId: string;
}
