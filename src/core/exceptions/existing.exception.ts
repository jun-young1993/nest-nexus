import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 리소스가 이미 존재할 때 발생하는 예외
 */
export class ExistingException extends HttpException {
  constructor(resource: string, identifier: string) {
    super(
      {
        message: `${resource} with identifier '${identifier}' already exists`,
        error: 'Resource Already Exists',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  }
}
