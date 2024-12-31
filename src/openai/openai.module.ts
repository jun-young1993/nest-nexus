import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiMiddleware } from './openai.middleware';
import { CodeItemModule } from 'src/code-item/code-item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from '../code/entities/code.entity';
import { ChatCompletion } from './entities/chat-completion.entity';
import { Choice } from './entities/choice.entity';
import { Message } from './entities/message.entity';
import { Usage } from './entities/usage.entity';
import { OpenaiChatSession } from './entities/openai-chat-session.entity';

@Module({
  imports: [
    CodeItemModule,
    TypeOrmModule.forFeature([
      ChatCompletion,
      Choice,
      Message,
      Usage,
      OpenaiChatSession,
    ]),
  ],
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OpenaiMiddleware).forRoutes(OpenaiController);
  }
}
