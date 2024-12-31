import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

class MessageDto {
  @IsString()
  @ApiProperty({
    example: 'hi?',
  })
  content: string;

  @IsString()
  @ApiProperty({
    example: 'assistant',
  })
  role: string;
}
export class CreateTemplateComplationChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  @ApiProperty({
    example: [
      {
        role: 'user',
        content: 'hi?',
      },
      {
        role: 'assistant',
        content: 'hi~',
      },
    ],
  })
  messages: MessageDto[];
}
