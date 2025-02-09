import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({
        example: 'jun young kim',
        description: 'The User Name'
    })
    @IsString()
    @MinLength(3)
    username: string; // 사용자 이름

    @ApiProperty({
        example: 'juny3738@gmail.com',
        description: 'The User Email'
    })
    @IsEmail()
    email: string; // 이메일

    @ApiProperty({
        example: '1234',
        description: 'The User Password'
    })
    @IsString()
    @MinLength(6)
    password: string; // 비밀번호

    @IsOptional()
    @IsBoolean()
    isActive?: boolean; // 활성 상태 (선택 사항, 기본값 true)
}