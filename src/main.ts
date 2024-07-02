import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService<AllConfigType>);
  
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(
    configService.getOrThrow('app.port', { infer: true }),
    configService.getOrThrow('app.host', { infer: true }),
    () => {
      console.log(`[START HTTP APP ] ${configService.getOrThrow('app.host', { infer: true })}:${configService.getOrThrow('app.port', { infer: true })}`)
    }
  );
}
bootstrap();