import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNoticeReplyDto {
  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  content: string;

  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  noticeId: string;

  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  userName: string;
}
