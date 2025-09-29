import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

/**
 * 현재 인증된 사용자 정보를 추출하는 데코레이터(X-Include-User-Group-Admin)
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
export const CurrentGroupAdminUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): User | null => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const user = request?.groupAdminUser;

    if (!user) {
      return null;
    }

    // 특정 속성을 요청한 경우
    if (data) {
      return user[data];
    }

    // 전체 사용자 정보 반환
    return user;
  },
);
