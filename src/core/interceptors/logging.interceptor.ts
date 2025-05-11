import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from '../../config/logger.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new CustomLogger();

  constructor() {
    this.logger.setContext('Performance');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          // 성능 로깅
          this.logger.log(`${method} ${url}`, {
            responseTime: `${responseTime}ms`,
            memoryUsage: process.memoryUsage(),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          // 에러 성능 로깅
          this.logger.error(`${method} ${url}`, error.stack, {
            responseTime: `${responseTime}ms`,
            memoryUsage: process.memoryUsage(),
            error: error.message,
          });
        },
      }),
    );
  }
} 