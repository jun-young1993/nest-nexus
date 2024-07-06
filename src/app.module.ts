import { Module } from '@nestjs/common';
import {HttpModule} from "./http/http.module";
import { AlieModule } from './alie/alie.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import appConfig from './config/app.config';
import alieConfig from './config/alie.config';
import {LoggerModule} from "./logger/Logger.module";
import { GithubModule } from './github/github.module';
import { OpenaiModule } from './openai/openai.module';
import githubConfig from "./config/github.config";
import gptConfig from "./config/gpt.config";

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          appConfig,
          alieConfig,
          githubConfig,
            gptConfig
        ],
        envFilePath: ['.env']
      }),
      HttpModule,
      AlieModule,
      TasksModule,
      LoggerModule,
      GithubModule,
      OpenaiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
