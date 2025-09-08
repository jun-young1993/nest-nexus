import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpLogger } from 'src/config/logger.config';
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly httpLogger = new HttpLogger();
  constructor() {}
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, params, ip } = req;
    const startTime = Date.now();
    const userAgent = req.get('user-agent') || '';
    // 요청 로깅

    this.httpLogger.log('Request', {
      startTime,
      method,
      originalUrl,
      body,
      params,
      query,
      ip,
      userAgent,
    });

    // 응답 로깅을 위한 이벤트 리스너
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      this.httpLogger.log('Response', {
        startTime,
        method,
        originalUrl,
        statusCode,
        duration,
      });
    });

    next();
  }
}
