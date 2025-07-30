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

@Module({
  imports: [
    AlieModule,
    GithubModule,
    OpenaiModule,
    GeminiModule,
    ParkingLocationModule,
    AppRewardModule,
    NoticeModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, ScheduleModule],
})
export class TasksModule {}
