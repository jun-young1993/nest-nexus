import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateTokenDto {
  @ApiProperty({
    description: 'alie o auth code',
    example: '123abs',
  })
  @IsString()
  code: string;
}
