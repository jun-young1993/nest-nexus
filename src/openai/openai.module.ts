import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiMiddleware } from './openai.middleware';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService]
})
export class OpenaiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(OpenaiMiddleware)
        .forRoutes(OpenaiController)
  }
}
