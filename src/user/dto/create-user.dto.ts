import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username: string; // 사용자 이름

    @IsEmail()
    email: string; // 이메일

    @IsString()
    @MinLength(6)
    password: string; // 비밀번호

    @IsOptional()
    @IsString()
    firstName?: string; // 이름 (선택 사항)

    @IsOptional()
    @IsString()
    lastName?: string; // 성 (선택 사항)

    @IsOptional()
    @IsBoolean()
    isActive?: boolean; // 활성 상태 (선택 사항, 기본값 true)
}