import { ApiProperty } from '@nestjs/swagger';
import { CreateNoticeDto } from 'src/notice/dto/create-notice.dto';
import { NoticeType } from 'src/notice/enum/notice.type';

export class CreateParkingLocationNoticeDto
  implements Pick<CreateNoticeDto, 'title' | 'content' | 'userName' | 'type'>
{
  @ApiProperty({
    example: 'test notice title',
  })
  title: string;

  @ApiProperty({
    example: 'test notice content',
  })
  content: string;

  @ApiProperty({
    example: 'test notice user id',
  })
  userName: string;

  @ApiProperty({
    example: 'test notice user id',
  })
  userId: string;

  @ApiProperty({
    example: 'NOTICE',
  })
  type?: NoticeType;
}
