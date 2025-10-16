import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { S3CreatedEvent } from '../events/s3-created.event';
import { createNestLogger } from 'src/factories/logger.factory';
import { CloudRunEmotionService } from 'src/cloud-run/emotion/cloud-run-emotion.service';
import { getEmotionsAboveThreshold } from 'src/cloud-run/emotion/interfaces/emotion-analysis-response.interface';

@Injectable()
export class S3CreatedListener {
  private readonly logger = createNestLogger(S3CreatedListener.name);
  constructor(
    private readonly cloudRunEmotionService: CloudRunEmotionService,
  ) {}

  @OnEvent(EventName.S3_OBJECT_CREATED)
  async handleS3Created(event: S3CreatedEvent) {
    const { s3Object } = event;
    this.logger.info(`[HANDLE S3 CREATED] ${s3Object.id}`);
    this.logger.info(`[HANDLE S3 FILE TYPE] ${s3Object.fileType}`);
    if (s3Object.isImage) {
      const result = await this.cloudRunEmotionService.analyzeByImageUrl(
        s3Object.url,
      );

      this.logger.info(
        `[HANDLE S3 IMAGE ANALYSIS RESULT] ${JSON.stringify(getEmotionsAboveThreshold(result, 0.3))}`,
      );
    }
  }
}
