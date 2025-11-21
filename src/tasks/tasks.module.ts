import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AlieModule } from '../alie/alie.module';
import { GithubModule } from '../github/github.module';
import { OpenaiModule } from '../openai/openai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GeminiModule } from 'src/gemini/gemini.module';
import { ParkingLocationModule } from 'src/parking-location/parking-location.module';
import { AppRewardModule } from 'src/app-reward/app-reward.module';
import { NoticeModule } from 'src/notice/notice.module';
import { AiModule } from 'src/ai/ai.module';
import { AwsS3Module } from 'src/aws/s3/aws-s3.module';
import { AwsS3CaptionTranslateJobService } from './jobs/aws-s3-caption-translate-job.service';

@Module({
  imports: [
    AlieModule,
    GithubModule,
    OpenaiModule,
    GeminiModule,
    ParkingLocationModule,
    AppRewardModule,
    NoticeModule,
    AiModule,
    AwsS3Module.forRoot(),
  ],
  controllers: [TasksController],
  providers: [TasksService, ScheduleModule, AwsS3CaptionTranslateJobService],
})
export class TasksModule {}
