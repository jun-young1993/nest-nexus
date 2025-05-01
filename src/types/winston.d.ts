/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from 'winston';

declare module 'winston' {
  interface Logger {
    task(message: string, ...meta: any[]): Logger;
  }
}
