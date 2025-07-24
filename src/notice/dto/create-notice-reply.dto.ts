import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNoticeReplyDto {
  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  content: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  userName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'test notice reply',
  })
  userId: string;
}
