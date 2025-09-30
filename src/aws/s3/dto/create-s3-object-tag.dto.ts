import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export class CreateS3ObjectTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'profile-image',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.toLowerCase())
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

  static fromJson(json: any): CreateS3ObjectTagDto {
    return plainToInstance(CreateS3ObjectTagDto, json);
  }
}
