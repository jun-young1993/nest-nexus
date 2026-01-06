import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
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
import { GoalModule } from './goal/goal.module';
import { AppConfigModule } from './app-config/app-config.module';
import { MailerModule } from './mailer/mailer.module';
import mailConfig from './config/mail.config';
import { VerificationCodeModule } from './verification-code/verification-code.module';
import { McpServerModule } from './mcp/mcp-server.module';
import { AdmobModule } from './admob/admob.module';
import { AppRewardModule } from './app-reward/app-reward.module';
import { LoanModule } from './loan/loan.module';
import { SequenceModule } from './sequence/sequence.module';
import loanScheduleFcmConfig from './config/loan-schedule-fcm.config';
import awsS3CredentialsConfig from './config/s3-credentials.config';
import { AwsS3Module } from './aws/s3/aws-s3.module';
import cloudRunConfig from './config/cloud-run.config';
import { CloudRunEmotionModule } from './cloud-run/emotion/cloud-run-emotion.module';
import { join } from 'path';
import { AiModule } from './ai/ai.module';
import aiConfig from './config/ai.config';
import transcoderConfig from './config/transcoder.config';
import { S3ObjectProcessorModule } from './aws/s3/processor/s3-object-processor.module';
import { CloudRunDeepFaceModule } from './cloud-run/ai-hub/deep-face/cloud-run-deep-face.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public/static'),
    }),
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
        loanScheduleFcmConfig,
        mailConfig,
        awsS3CredentialsConfig,
        cloudRunConfig,
        aiConfig,
        transcoderConfig,
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
    GoalModule,
    AppConfigModule,
    MailerModule,
    VerificationCodeModule,
    McpServerModule,
    AdmobModule,
    AppRewardModule,
    LoanModule,
    SequenceModule,
    AwsS3Module.forRoot(),
    CloudRunEmotionModule,
    AiModule,
    S3ObjectProcessorModule,
    CloudRunDeepFaceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
