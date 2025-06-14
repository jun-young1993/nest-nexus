import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificationCodeDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'caught-smoking', description: '앱 Key' })
  @IsString()
  @IsNotEmpty()
  appKey: string;
}

export class VerifyCodeDto {
  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'User ID',
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: '6자리 인증번호' })
  @IsString()
  @Length(6, 6)
  code: string;
}
