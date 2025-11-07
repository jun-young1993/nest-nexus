import { FileValidator } from '@nestjs/common';
import {
  createNestLogger,
  NestLoggerWrapper,
} from 'src/factories/logger.factory';

interface FileLoggerValidatorOptions {
  loggerName: string;
}

/**
 * 파일 정보를 로그로 출력하는 커스텀 validator
 */
export class FileLoggerValidator extends FileValidator<FileLoggerValidatorOptions> {
  private logger: NestLoggerWrapper;
  constructor(options: FileLoggerValidatorOptions) {
    super(options);

    this.logger = createNestLogger(options.loggerName);
  }

  isValid(file: Express.Multer.File): boolean {
    this.logger.log('[File Logger Validator] File information:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? `Buffer(${file.buffer.length} bytes)` : null,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
    });
    return true;
  }

  buildErrorMessage(): string {
    return '[File Logger Validator] File information logging failed';
  }
}
