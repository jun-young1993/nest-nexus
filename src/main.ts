import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import * as fs from 'fs';
import { IoAdapter } from '@nestjs/platform-socket.io';
// import { AdminPageModule } from 'nest-admin-page';

async function bootstrap() {
 
  
  const app = await NestFactory.create(AppModule,{
    httpsOptions: (process.env.APP_SSL_KEY && process.env.APP_SSL_CRT) ? {
      key: fs.readFileSync(process.env.APP_SSL_KEY),
      cert: fs.readFileSync(process.env.APP_SSL_CRT)
    } : null
  });
  
  const configService = app.get(ConfigService<AllConfigType>);
  
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useWebSocketAdapter(new IoAdapter(app));
  
  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  // AdminPageModule.setup('admin', app);
  const listenEvent = () => {
    console.log(`[START HTTP APP ] ${configService.getOrThrow('app.host', { infer: true })}:${configService.getOrThrow('app.port', { infer: true })}`)
  }
  await app.listen(
    configService.getOrThrow('app.port', { infer: true }),
    (configService.getOrThrow('app.host', { infer: true }) && configService.getOrThrow('app.host', { infer: true })),
    () => listenEvent()
  );
}
bootstrap();