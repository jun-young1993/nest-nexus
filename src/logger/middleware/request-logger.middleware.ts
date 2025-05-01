import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, params, ip } = req;
    const startTime = Date.now();
    const userAgent = req.get('user-agent') || '';
    // 요청 로깅
    this.logger.http('[REQUEST MIDDLEWARE] START');
    this.logger.http(`[Request] ${method} ${originalUrl}`);
    this.logger.http('Query:', query);
    this.logger.http('Params:', params);
    this.logger.http('Body:', body);
    this.logger.http('IP:', ip);
    this.logger.http('User-Agent:', userAgent);
    this.logger.http('[REQUEST MIDDLEWARE] END');

    // 응답 로깅을 위한 이벤트 리스너
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      this.logger.http(
        `[Response] ${method} ${originalUrl} ${statusCode} ${duration}ms`,
      );
    });

    next();
  }
}
