import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { AlieModule } from './alie/alie.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import appConfig from './config/app.config';
import alieConfig from './config/alie.config';
import { LoggerModule } from './logger/Logger.module';
import { GithubModule } from './github/github.module';
import { OpenaiModule } from './openai/openai.module';

import githubConfig from './config/github.config';
import gptConfig from './config/gpt.config';
import { SocketEventModule } from './socket/events/socket-event.module';
import { GeminiModule } from './gemini/gemini.module';
import geminiConfig from './config/gemini.config';
import logConfig from './config/log.config';
import dbConfig from './config/db.config';
import { TypeormModule } from './typeorm/typeorm.module';
import { CodeModule } from './code/code.module';
import { CodeItemModule } from './code-item/code-item.module';
import { NexusModule } from './nexus/nexus.module';
import { FourPillarsModule } from './four-pillars/four-pillars.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        alieConfig,
        githubConfig,
        gptConfig,
        geminiConfig,
        logConfig,
        dbConfig,
      ],
      envFilePath: ['.env'],
    }),
    TypeormModule,
    HttpModule,
    AlieModule,
    TasksModule,
    LoggerModule,
    GithubModule,
    OpenaiModule,
    SocketEventModule,
    GeminiModule,
    CodeModule,
    CodeItemModule,
    NexusModule,
    FourPillarsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
