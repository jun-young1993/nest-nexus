import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppConfigDto {
  @ApiProperty({ description: '버전', required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '설정 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
