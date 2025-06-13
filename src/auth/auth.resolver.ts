import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse, LoginInput } from './models/auth.model';
import { Response, Request } from 'express';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') loginInput: LoginInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const user = await this.authService.validateUser(loginInput);
    const tokenExpiresIn = 3600 * 4;
    const result = await this.authService.login(user, {
      expiresIn: tokenExpiresIn,
    });
    // 쿠키에 accessToken 저장 (httpOnly, secure 옵션 설정)
    res.cookie('Authorization', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 전송
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF 보호
      maxAge: tokenExpiresIn * 1000, // 1시간 후 만료
    });
    return result;
  }

  // ✅ `Authorization` 헤더에서 유저 정보 찾기
  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: { req: Request }): Promise<Express.User> {
    return context.req.user;
  }
}
