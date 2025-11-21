import { ApiProperty } from '@nestjs/swagger';

export class TranslateResponseDto {
  @ApiProperty({
    example: '침대에 이불을 놓고있는 아기가 있습니다',
    description: '번역된 텍스트',
  })
  translatedText: string;
}

