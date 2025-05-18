import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAppConfigDto {
  @ApiProperty({ description: '설정 키' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ description: '버전' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({ description: '설정 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
