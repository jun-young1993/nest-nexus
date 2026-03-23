import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// 👉 1. 자동 Firebase 선택 (고급)
// const decoded = await admin.auth().verifyIdToken(token);
// const projectId = decoded.aud;

// 👉 토큰에서 projectId 추출해서 자동 라우팅 가능
export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-app-id'];
  },
);
