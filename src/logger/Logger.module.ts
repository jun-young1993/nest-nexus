import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

// 커스텀 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  task: 4,
  debug: 5,
  silly: 6,
};

// 로그 레벨 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  task: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

// 색상 추가
winston.addColors(colors);

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        levels,
        transports: [
          new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
                prettyPrint: true,
              }),
            ),
          }),
          new winstonDaily({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.printf((info) => {
                const context = info.context || process.env.APP_NAME;
                return `[${info.timestamp}] ${context}.${info.level}: ${info.message}`;
              }),
            ),
            dirname: configService.get('log.dir', { infer: true }),
            filename: '%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
          new winstonDaily({
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.printf((info) => {
                const context = info.context || process.env.APP_NAME;
                return `[${info.timestamp}] ${context}.${info.level}: ${info.message}`;
              }),
            ),
            dirname: configService.get('log.dir', { infer: true }),
            filename: 'error.%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
          new winstonDaily({
            level: 'http',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.printf((info) => {
                const context = info.context || process.env.APP_NAME;
                return `[${info.timestamp}] ${context}.${info.level}: ${info.message}`;
              }),
            ),
            dirname: configService.get('log.dir', { infer: true }),
            filename: 'http.%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
          new winstonDaily({
            level: 'task',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.printf((info) => {
                const context = info.context || process.env.APP_NAME;
                return `[${info.timestamp}] ${context}.${info.level}: ${info.message}`;
              }),
            ),
            dirname: configService.get('log.dir', { infer: true }),
            filename: 'task.%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
