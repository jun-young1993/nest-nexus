import { Module } from '@nestjs/common';
import {
    WinstonModule,
    utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";




@Module({
    imports: [
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (
                configService: ConfigService<AllConfigType>
            ) => ({
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
                            winston.format.printf(
                                (info) =>
                                    `[${info.timestamp}] ${process.env.APP_NAME}.${info.level}: ${info.message}`,
                            ),
                        ),
                        dirname: configService.get('app.log_dir',{infer: true}),
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
                            winston.format.printf(
                                (info) =>
                                    `[${info.timestamp}] ${process.env.APP_NAME}.${info.level}: ${info.message}`,
                            ),
                        ),
                        dirname: configService.get('app.log_dir',{infer: true}),
                        filename: 'error.%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        zippedArchive: true,
                        maxSize: '20m',
                        maxFiles: '14d',
                    }),
                ],
            }),
            inject: [ConfigService]
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule {}
