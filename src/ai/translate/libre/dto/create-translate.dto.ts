import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTranslateDto {
  @ApiProperty({
    example: 'Hello, world!',
    description: 'The text to translate',
  })
  @IsString()
  text: string;
  @ApiProperty({ example: 'en', description: 'The source language' })
  @IsString()
  source: string;
  @ApiProperty({ example: 'ko', description: 'The target language' })
  @IsString()
  target: string;
}
