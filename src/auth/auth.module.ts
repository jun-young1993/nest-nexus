import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "../user/entities/user.entity";


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret', // 환경 변수로 관리
      signOptions: { expiresIn: '1h' }, // 토큰 유효기간 설정
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}