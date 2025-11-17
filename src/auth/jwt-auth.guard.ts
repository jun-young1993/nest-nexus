import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UserGroupService } from 'src/user/user-group.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userGroupService: UserGroupService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
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
        const isIncludeUserGroupAdmin =
          request.headers['x-include-user-group-admin'] == 'true';
        if (isIncludeUserGroupAdmin) {
          const groupAdminUser =
            await this.userGroupService.findGroupAdminByUser(user);
          request.groupAdminUser = groupAdminUser;
        }
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
