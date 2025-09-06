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
    let authHeader: string | null = null;
    if (ctx.req) {
      authHeader = ctx.req.headers.authorization;
    } else {
      const request = context.switchToHttp().getRequest();
      authHeader = request.headers.authorization;
    }

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (token.startsWith('user:')) {
      const userId = token.split(':')[1];

      const user = await this.authService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }
      if (ctx.req) {
        ctx.req.user = user;
      } else {
        const request = context.switchToHttp().getRequest();
        request.user = user;
      }
      return true;
    }

    const user = await this.authService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // ✅ 요청 객체에 유저 정보 추가
    if (ctx.req) {
      ctx.req.user = user;
    } else {
      const request = context.switchToHttp().getRequest();
      request.user = user;
    }

    return true;
  }
}
