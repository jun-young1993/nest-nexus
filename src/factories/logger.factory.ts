import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

// error 레벨을 제외하는 custom transport
class ExcludeErrorTransport extends winston.transports.DailyRotateFile {
  log(info: any, callback?: () => void) {
    if (info.level === 'error') {
      // error 레벨은 건너뛰기
      if (callback) {
        callback();
      }
      return;
    }
    // error가 아닌 경우에만 부모 클래스의 log 호출
    super.log(info, callback);
  }
}

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

/**
 * 동적으로 윈스톤 로거를 생성하는 팩토리 함수
 * @param serviceName 서비스 이름 (예: 's3-object-tag', 'user-service')
 * @param options 추가 옵션
 */
export function createServiceLogger(
  serviceName: string,
  options: {
    maxSize?: string;
    maxFiles?: string;
    consoleOutput?: boolean;
  } = {},
) {
  const { maxSize = '20m', maxFiles = '14d', consoleOutput = true } = options;

  const logger = winston.createLogger({
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
      new ExcludeErrorTransport({
        filename: `storage/logs/${serviceName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize,
        maxFiles,
        level: 'silly', // 모든 레벨을 받지만 error는 제외
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          logFormat,
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: `storage/logs/${serviceName}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize,
        maxFiles,
        level: 'error', // error 레벨만 별도 파일에 저장
      }),
    ],
  });

  // 개발 환경에서 콘솔 출력
  if (process.env.NODE_ENV !== 'production' && consoleOutput) {
    logger.add(
      new winston.transports.Console({
        format: combine(colorize(), logFormat),
      }),
    );
  }

  return logger;
}

/**
 * NestJS Logger 인터페이스를 구현한 래퍼 클래스
 */
export class NestLoggerWrapper {
  constructor(private winstonLogger: winston.Logger) {}

  info(message: string, metadata?: any) {
    this.winstonLogger.info(message, metadata);
  }

  log(message: string, metadata?: any) {
    this.winstonLogger.info(message, metadata);
  }

  error(message: string, metadata?: any) {
    const error = metadata?.error || { message };
    this.winstonLogger.error(message, { ...metadata, error });
  }

  warn(message: string, metadata?: any) {
    this.winstonLogger.warn(message, metadata);
  }

  debug(message: string, metadata?: any) {
    this.winstonLogger.debug(message, metadata);
  }

  verbose(message: string, metadata?: any) {
    this.winstonLogger.verbose(message, metadata);
  }
}

/**
 * 서비스별 로거를 쉽게 생성하는 헬퍼 함수
 */
export function createNestLogger(serviceName: string, options?: any) {
  const winstonLogger = createServiceLogger(serviceName, options);
  return new NestLoggerWrapper(winstonLogger);
}
