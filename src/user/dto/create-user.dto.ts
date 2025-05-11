import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../enum/user.type';

export class CreateUserDto {
  @ApiProperty({
    example: 'jun young kim',
    description: 'The User Name',
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  username: string; // 사용자 이름

  @ApiProperty({
    example: 'juny3738@gmail.com',
    description: 'The User Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string; // 이메일

  @ApiProperty({
    example: '1234',
    description: 'The User Password',
  })
  @IsString()
  @MinLength(6)
  password: string; // 비밀번호

  @ApiProperty({
    example: 'USER',
    description: 'The User Type',
    enum: UserType,
    default: UserType.USER,
  })
  @IsOptional()
  @IsEnum(UserType)
  type: UserType; // 유저 타입

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // 활성 상태 (선택 사항, 기본값 true)
}
