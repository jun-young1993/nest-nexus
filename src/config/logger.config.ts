import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Request } from 'express';

const { combine, timestamp, printf, colorize } = winston.format;

export const baseLogData = (request: Request) => {
  return {
    timestamp: new Date().toISOString(),
    userAgent: request.headers['user-agent'],
    ip: request.ip || request.connection.remoteAddress,
    headers: request.headers,
    query: request.query,
  };
};

interface ErrorObject {
  message: string;
  stack?: string;
}

// 메타데이터 처리 함수
const formatMetadata = (metadata: any): string => {
  if (!metadata || typeof metadata !== 'object') {
    return '';
  }

  // 문자열 배열인 경우 하나의 문자열로 합치기
  if (Array.isArray(metadata)) {
    return metadata.join('');
  }

  // 객체의 모든 값이 문자열이고 키가 숫자인 경우 (분리된 문자열)
  if (Object.keys(metadata).every((key) => !isNaN(Number(key)))) {
    return Object.values(metadata).join('');
  }

  // 일반 객체인 경우 JSON으로 변환
  return JSON.stringify(metadata, null, 2);
};

// 로그 포맷 정의
const logFormat = printf(
  ({ level, message, timestamp, context, error, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;
    if (context) {
      msg += ` [${context}]`;
    }
    msg += ` : ${message}`;

    // 에러 정보가 있는 경우 추가
    if (error) {
      const errorObj = error as ErrorObject;
      msg += `\nError: ${errorObj.message}`;
      if (errorObj.stack) {
        msg += `\nStack: ${errorObj.stack}`;
      }
    }

    // 메타데이터가 있는 경우 추가
    const metadataStr = formatMetadata(metadata);
    if (metadataStr) {
      msg += `\n${metadataStr}`;
    }
    return msg;
  },
);

// HTTP 요청 로그 포맷
const httpLogFormat = printf(
  ({
    level,
    message,
    timestamp,
    method,
    url,
    statusCode,
    responseTime,
    error,
    ...metadata
  }) => {
    let msg = `${timestamp} [${level}]`;
    if (method && url) {
      msg += ` ${method} ${url}`;
    }
    if (statusCode) {
      msg += ` ${statusCode}`;
    }
    if (responseTime) {
      msg += ` ${responseTime}`;
    }
    msg += ` : ${message}`;

    // 에러 정보가 있는 경우 추가
    if (error) {
      const errorObj = error as ErrorObject;
      msg += `\nError: ${errorObj.message}`;
      if (errorObj.stack) {
        msg += `\nStack: ${errorObj.stack}`;
      }
    }

    // 메타데이터가 있는 경우 추가
    const metadataStr = formatMetadata(metadata);
    if (metadataStr) {
      msg += `\n${metadataStr}`;
    }
    return msg;
  },
);

// 일반 로그 설정
const generalLogger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'storage/logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// HTTP 로그 설정
const httpLogger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), httpLogFormat),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'storage/logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// AdMob reward callback 로그 설정
const admobLogger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'storage/logs/admob-reward-callback-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// 개발 환경일 경우 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  generalLogger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );
  httpLogger.add(
    new winston.transports.Console({
      format: combine(colorize(), httpLogFormat),
    }),
  );
  admobLogger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );
}

// NestJS LoggerService 구현
export class CustomLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join('');
    }
    return JSON.stringify(message);
  }

  log(message: any, ...optionalParams: any[]) {
    const formattedMessage = this.formatMessage(message);
    const metadata = optionalParams.length > 0 ? optionalParams[0] : {};
    generalLogger.info(formattedMessage, {
      context: this.context,
      ...metadata,
    });
  }

  error(message: any, trace?: string, ...optionalParams: any[]) {
    const formattedMessage = this.formatMessage(message);
    const metadata = optionalParams.length > 0 ? optionalParams[0] : {};
    const error =
      typeof message === 'object' && message instanceof Error ? message : null;

    generalLogger.error(formattedMessage, {
      context: this.context,
      error: error || { message: formattedMessage, stack: trace },
      ...metadata,
    });
  }

  warn(message: any, ...optionalParams: any[]) {
    const formattedMessage = this.formatMessage(message);
    const metadata = optionalParams.length > 0 ? optionalParams[0] : {};
    generalLogger.warn(formattedMessage, {
      context: this.context,
      ...metadata,
    });
  }

  debug(message: any, ...optionalParams: any[]) {
    const formattedMessage = this.formatMessage(message);
    const metadata = optionalParams.length > 0 ? optionalParams[0] : {};
    generalLogger.debug(formattedMessage, {
      context: this.context,
      ...metadata,
    });
  }

  verbose(message: any, ...optionalParams: any[]) {
    const formattedMessage = this.formatMessage(message);
    const metadata = optionalParams.length > 0 ? optionalParams[0] : {};
    generalLogger.verbose(formattedMessage, {
      context: this.context,
      ...metadata,
    });
  }
}

// HTTP 로거
export class HttpLogger {
  log(message: string, metadata?: any) {
    httpLogger.info(message, metadata);
  }

  error(message: string, metadata?: any) {
    const error = metadata?.error || { message };
    httpLogger.error(message, { ...metadata, error });
  }
}

// AdMob 로거
export class AdmobLogger {
  log(message: string, metadata?: any) {
    admobLogger.info(message, metadata);
  }

  error(message: string, metadata?: any) {
    const error = metadata?.error || { message };
    admobLogger.error(message, { ...metadata, error });
  }

  warn(message: string, metadata?: any) {
    admobLogger.warn(message, metadata);
  }
}
