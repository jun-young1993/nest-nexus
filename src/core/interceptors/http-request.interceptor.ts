import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { HttpLogger } from '../../config/logger.config';

@Injectable()
export class HttpRequestInterceptor implements NestInterceptor {
  private readonly httpLogger = new HttpLogger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, query, headers, ip } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    // 요청 시작 로깅
    this.httpLogger.log('Request', {
      method,
      url,
      body,
      params,
      query,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          // 응답 성공 로깅
          this.httpLogger.log('Response', {
            method,
            url,
            statusCode: 200,
            responseTime: `${responseTime}ms`,
            responseSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          // 응답 에러 로깅
          this.httpLogger.error('Error', {
            method,
            url,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            error: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }
}
