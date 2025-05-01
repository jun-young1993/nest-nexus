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
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ThreeObjectModule } from './three-object/three-object.module';
import { ParkingLocationModule } from './parking-location/parking-location.module';
import { NoticeModule } from './notice/notice.module';
import { LogModule } from './log/log.module';
import { FirebaseModule } from './firebase/firebase.module';
import myHomeParkingFcmConfig from './config/my-home-parking-fcm.config';
import { EventModule } from './event/event.module';
import { ScheduleModule } from '@nestjs/schedule';

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
        myHomeParkingFcmConfig,
      ],
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    EventModule,
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
    PostModule,
    AuthModule,
    UserModule,
    ThreeObjectModule,
    ParkingLocationModule,
    NoticeModule,
    LogModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
