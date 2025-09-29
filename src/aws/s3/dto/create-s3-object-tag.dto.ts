import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateS3ObjectTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'profile-image',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Tag color in hex format',
    example: '#FF5733',
    default: '#FFFFFF',
  })
  @IsOptional()
  @IsHexColor()
  color?: string = '#FFFFFF';

  @ApiProperty({
    description: 'Tag type/category',
    example: 'image',
    maxLength: 30,
  })
  @IsString()
  @MaxLength(30)
  type: string;
}
