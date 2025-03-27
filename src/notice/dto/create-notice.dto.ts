import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

  @IsString()
  @ApiProperty({
    example: 'test notice group id',
  })
  noticeGroupId: string;

  @IsString()
  @ApiProperty({
    example: 'test notice user id',
  })
  userId: string;
}
