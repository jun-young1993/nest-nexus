import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CloudRunEmotionService } from './cloud-run-emotion.service';
import { CloudRunEmotionController } from './cloud-run-emotion.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [CloudRunEmotionService, CloudRunEmotionController],
  exports: [CloudRunEmotionService, CloudRunEmotionController],
  controllers: [CloudRunEmotionController],
})
export class CloudRunEmotionModule {}
