import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNoticeGroupDto {
  @IsString()
  @ApiProperty({
    example: 'test notice group',
  })
  name: string;
}
