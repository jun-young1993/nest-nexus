import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export class CurrentUserAndGroupAdminUserResponse {
  constructor(
    public readonly user: User,
    public readonly groupAdminUser: User | null,
  ) {}

  toArray(): [User, ...User[]] {
    return [this.user, ...(this.groupAdminUser ? [this.groupAdminUser] : [])];
  }

  toObject(): { user: User; groupAdminUser?: User } {
    return {
      user: this.user,
      ...(this.groupAdminUser ? { groupAdminUser: this.groupAdminUser } : {}),
    };
  }
}

/**
 * 현재 인증된 사용자 정보를 추출하는 데코레이터
 * @param data - 추출할 사용자 속성 (선택사항)
 * @returns 사용자 정보 또는 특정 속성
 *
 * @example
 * // 전체 사용자 정보
 * @CurrentUser() user: User
 *
 * // 특정 속성만 추출
 * @CurrentUser('id') userId: string
 * @CurrentUser('email') userEmail: string
 */
export const CurrentUserAndGroupAdminUser = createParamDecorator(
  (
    _: string | undefined,
    context: ExecutionContext,
  ): CurrentUserAndGroupAdminUserResponse => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const user = request.user;
    const groupAdminUser = request.groupAdminUser;
    return new CurrentUserAndGroupAdminUserResponse(user, groupAdminUser);
  },
);
