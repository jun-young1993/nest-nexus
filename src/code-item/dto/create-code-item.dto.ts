import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCodeItemDto {
  @IsString()
  @ApiProperty({
    example: 'test_code_key',
  })
  key: string;

  @IsString()
  @ApiProperty({
    example: 'test_code_value',
  })
  value: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'test_code_description',
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  code_id: number;
}
