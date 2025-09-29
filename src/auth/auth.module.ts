import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret', // 환경 변수로 관리
      signOptions: { expiresIn: '1h' }, // 토큰 유효기간 설정
    }),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthResolver, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
