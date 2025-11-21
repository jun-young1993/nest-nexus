import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LibreService } from 'src/ai/translate/libre/libre.service';
import { S3ObjectMetadataService } from 'src/aws/s3/s3-object-metadata.service';
import { AllConfigType } from 'src/config/config.type';
import { createNestLogger } from 'src/factories/logger.factory';

@Injectable()
export class AwsS3CaptionTranslateJobService {
  private readonly logger = createNestLogger(
    AwsS3CaptionTranslateJobService.name,
  );
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly s3ObjectMetadataService: S3ObjectMetadataService,
    private readonly libreService: LibreService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async captionKoTranslateJob() {
    try {
      const isUse = this.configService.getOrThrow('ai.libreTranslate.use', {
        infer: true,
      });
      if (isUse !== true) {
        this.logger.info(
          '[CAPTION KO TRANSLATE][TASK SKIP] LIBRE TRANSLATE IS NOT USED',
        );
        return;
      }
      this.logger.info('[CAPTION KO TRANSLATE][TASK START]');
      const metadataList =
        await this.s3ObjectMetadataService.findCaptionKoIsNull();
      this.logger.info(
        `[CAPTION KO TRANSLATE][TASK COUNT] ${metadataList.length}`,
      );
      for (const metadata of metadataList) {
        const caption = await this.libreService.translate(
          metadata.caption,
          'en',
          'ko',
        );
        metadata.captionKo = caption.translatedText;
        await this.s3ObjectMetadataService.update(metadata);
        this.logger.info(`[CAPTION KO TRANSLATE][TASK COUNT] ${metadata.id}`);
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.logger.info('[CAPTION KO TRANSLATE][TASK END]');
    }
  }
}
