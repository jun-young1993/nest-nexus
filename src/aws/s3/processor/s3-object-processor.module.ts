import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AwsS3QueueName } from '../enum/job-name';
import { TranscoderProcessor } from './aws-s3-transcoder.processor';
import { ConfigModule } from '@nestjs/config';
import { AwsS3Module } from '../aws-s3.module';
import { AwsTranscoderService } from './aws-transcoder.service';
import { AwsS3ProcessorController } from './aws-s3-processor.controller';

@Module({
  controllers: [AwsS3ProcessorController],
  imports: [
    ConfigModule,
    AwsS3Module.forRoot(),
    BullModule.registerQueue({
      name: AwsS3QueueName.AWS_TRANSCORDER,
    }),
  ],
  providers: [TranscoderProcessor, AwsTranscoderService],
  exports: [TranscoderProcessor, AwsTranscoderService],
})
export class S3ObjectProcessorModule {}
