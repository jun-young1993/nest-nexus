import { Injectable } from '@nestjs/common';

import { S3LowResProcessorInterface } from './interfaces/s3-low-res-processor.interface';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import ffmpeg from 'fluent-ffmpeg';
import { AwsS3JobName } from './enum/job-name';

@Injectable()
export class AwsTranscoderService {
  constructor(
    @InjectQueue('aws-transcoder') private transcoderQueue: Queue,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    const ffmpegPath = this.configService.getOrThrow('transcoder.ffmpeg_path', {
      infer: true,
    });
    const ffprobePath = this.configService.getOrThrow(
      'transcoder.ffprobe_path',
      {
        infer: true,
      },
    );
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
  }

  async generateLowRes(jobOption: S3LowResProcessorInterface) {
    const job = await this.transcoderQueue.add(
      AwsS3JobName.GENERATE_LOW_RES,
      jobOption,
    );
    return job;
  }

  async generateLowResProcess(jobOption: S3LowResProcessorInterface) {}
}
