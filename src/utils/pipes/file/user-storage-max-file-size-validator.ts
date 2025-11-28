import { FileValidator } from '@nestjs/common';
import {
  createNestLogger,
  NestLoggerWrapper,
} from 'src/factories/logger.factory';

interface UserStorageMaxFileSizeValidatorOptions {
  loggerName: string;
}
export class UserStorageMaxFileSizeValidator extends FileValidator<UserStorageMaxFileSizeValidatorOptions> {
  private logger: NestLoggerWrapper;
  constructor(options: UserStorageMaxFileSizeValidatorOptions) {
    super(options);
    this.logger = createNestLogger(options.loggerName);
  }

  isValid(_file: Express.Multer.File): boolean {
    return true;
  }
  buildErrorMessage(): string {
    return 'File size exceeds the maximum allowed size';
  }
}
