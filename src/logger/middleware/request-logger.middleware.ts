import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, params } = req;
    const startTime = Date.now();

    // 요청 로깅
    console.log(`[Request] ${method} ${originalUrl}`);
    console.log('Query:', query);
    console.log('Params:', params);
    console.log('Body:', body);

    // 응답 로깅을 위한 이벤트 리스너
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      console.log(
        `[Response] ${method} ${originalUrl} ${statusCode} ${duration}ms`,
      );
    });

    next();
  }
}
