import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AwsS3JobName, AwsS3QueueName } from '../enum/job-name';
import { S3LowResProcessorInterface } from '../interfaces/s3-low-res-processor.interface';
import { AwsTranscoderService } from './aws-transcoder.service';

@Processor(AwsS3QueueName.AWS_TRANSCORDER)
export class TranscoderProcessor {
  constructor(private readonly transcoderService: AwsTranscoderService) {}

  @Process(AwsS3JobName.GENERATE_LOW_RES)
  async generateLowRes(job: Job<S3LowResProcessorInterface>) {
    await this.transcoderService.generateLowResProcess(job.data);
  }
}
