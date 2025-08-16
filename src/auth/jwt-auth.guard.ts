import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.getArgs()[2]; // GraphQL Context

    const authHeader = ctx.req.headers.authorization;
    console.log('=>(jwt-auth.guard.ts:15) ctx.req.headers', ctx.req.headers);
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    const user = await this.authService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // ✅ 요청 객체에 유저 정보 추가
    ctx.req.user = user;
    return true;
  }
}
