import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import * as fs from 'fs';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import * as expressBasicAuth from 'express-basic-auth';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions:
      process.env.APP_SSL_KEY && process.env.APP_SSL_CRT
        ? {
            key: fs.readFileSync(process.env.APP_SSL_KEY),
            cert: fs.readFileSync(process.env.APP_SSL_CRT),
          }
        : null,
    // logger: new CustomLogger(),
  });

  const configService = app.get(ConfigService<AllConfigType>);

  // app.setGlobalPrefix('/api', { exclude: ['sse', 'messages', 'mcp'] });

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new IoAdapter(app));
  const allowedOrigins = process.env.ALLOW_ORIGINS.split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });
  app.use(cookieParser());

  if (!(process.env.SWAGGER_USER && process.env.SWAGGER_PASSWORD)) {
    throw new Error(
      'SWAGGER_USER 또는 SWAGGER_PASSWORD가 설정되지 않았습니다.',
    );
  }
  // Swagger Basic Auth 설정
  app.use(
    ['/docs', '/docs-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  // 전역 인터셉터 적용
  app.useGlobalInterceptors(
    // new HttpRequestInterceptor(),
    // new LoggingInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // 전역 예외 필터 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  // AdminPageModule.setup('admin', app);
  const listenEvent = () => {
    console.log(
      `[START HTTP APP ] ${configService.getOrThrow('app.host', { infer: true })}:${configService.getOrThrow('app.port', { infer: true })}`,
    );
  };
  await app.listen(
    configService.getOrThrow('app.port', { infer: true }),
    configService.getOrThrow('app.host', { infer: true }) &&
      configService.getOrThrow('app.host', { infer: true }),
    () => listenEvent(),
  );
}
bootstrap();
