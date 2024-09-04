import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiMiddleware } from './openai.middleware';
import { CodeItemModule } from 'src/code-item/code-item.module';

@Module({
  imports: [
    CodeItemModule
  ],
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
