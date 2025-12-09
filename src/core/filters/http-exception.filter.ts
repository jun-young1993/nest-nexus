import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createNestLogger } from 'src/factories/logger.factory';

/**
 * 모든 예외를 처리하는 전역 예외 필터
 * HttpException과 일반 Error 모두를 처리합니다.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = createNestLogger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let errorResponse: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'object' && errorResponse['message']
          ? errorResponse['message']
          : exception.message;
    } else {
      // 일반 Error나 기타 예외 처리
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const error = exception as Error;
      message = error.message || 'Internal server error';
      errorResponse = {
        message,
        error: error.name || 'Error',
        statusCode: status,
      };
    }

    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      error: errorResponse,
      exceptionName:
        exception instanceof Error ? exception.constructor.name : 'Unknown',
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      params: request.params,
      query: request.query,
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
        authorization: request.headers.authorization ? '[REDACTED]' : undefined,
      },
      ip: request.ip || request.connection.remoteAddress,
    };

    // 에러 로그 기록
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} ${message}`,
      errorLog,
    );

    // 클라이언트 응답
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }
}
