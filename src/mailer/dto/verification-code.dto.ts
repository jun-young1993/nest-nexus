import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationCodeDto {
  @IsString()
  @ApiProperty({
    example: '123456',
    description: '인증번호',
  })
  @IsNotEmpty()
  verificationCode: string;

  @IsString()
  @ApiProperty({
    example: 'juny3738@gmail.com',
    description: '이메일',
  })
  @IsNotEmpty()
  to: string;
}
