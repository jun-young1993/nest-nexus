import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { S3CreatedEvent } from '../events/s3-created.event';
import { createNestLogger } from 'src/factories/logger.factory';
import { CloudRunEmotionService } from 'src/cloud-run/emotion/cloud-run-emotion.service';
import { getEmotionsAboveThreshold } from 'src/cloud-run/emotion/interfaces/emotion-analysis-response.interface';
import { S3ObjectTagService } from '../s3-object-tag.service';
import { CreateS3ObjectTagDto } from '../dto/create-s3-object-tag.dto';
import { TagType } from '../enum/tag.type';
import { AwsS3Service } from '../aws-s3.service';
import { S3Object } from '../entities/s3-object.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsS3AppNames } from 'src/config/config.type';
import { S3ObjectDestinationType } from '../enum/s3-object-destination.type';
import { CreateS3MetadataDto } from '../dto/create-s3-metadata.dto';
import { S3ObjectMetadataService } from '../s3-object-metadata.service';

@Injectable()
export class S3CreatedListener {
  private readonly logger = createNestLogger(S3CreatedListener.name);

  constructor(
    private readonly cloudRunEmotionService: CloudRunEmotionService,
    private readonly s3ObjectTagService: S3ObjectTagService,
    private readonly awsS3Service: AwsS3Service,
    private readonly s3ObjectMetadataService: S3ObjectMetadataService,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  /**
   * S3 객체 생성 이벤트 핸들러
   * @param event - S3 생성 이벤트
   */
  @OnEvent(EventName.S3_OBJECT_CREATED)
  async handleS3Created(event: S3CreatedEvent) {
    const { s3Object } = event;
    this.logger.info(`[HANDLE S3 CREATED] ${s3Object.id}`);
    this.logger.info(`[HANDLE S3 FILE TYPE] ${s3Object.fileType}`);

    if (s3Object.isThumbnail) {
      return;
    }
    // 썸네일이 아닌 일반 이미지만 분석
    if (s3Object.isImage) {
      await this.analyzeImage(s3Object);
      await this.imageToCaption(s3Object, s3Object.url);
    }

    // 비디오 파일 처리 (썸네일 생성)
    if (s3Object.isVideo) {
      await this.processVideo(s3Object.appName, s3Object);
      const videoObject = await this.awsS3Service.findOneOrFail(s3Object.id);
      if (!videoObject.isThumbnail) {
        this.logger.warn(`[VIDEO OBJECT IS NOT THUMBNAIL] ${videoObject.id}`);
        return false;
      }

      const videoThumbnailUrl = videoObject.thumbnail.url;
      await this.imageToCaption(videoObject, videoThumbnailUrl);
    }
  }

  async imageToCaption(s3Object: S3Object, url: string): Promise<void> {
    try {
      this.logger.info(`[IMAGE TO CAPTION START] ${s3Object.id}`);
      const result = await this.cloudRunEmotionService.imageToCaption(url);
      const metadata = await this.s3ObjectMetadataService.create(
        CreateS3MetadataDto.fromJson({
          s3Object: s3Object,
          caption: result.text,
        }),
      );
      this.logger.info(`[IMAGE TO CAPTION RESULT] ${metadata.id}`);
    } catch (error) {
      this.logger.error(
        `[IMAGE TO CAPTION ERROR] ${s3Object.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 이미지 감정 분석
   * @param s3Object - 이미지 S3Object
   * @returns 업데이트된 S3Object
   */
  async analyzeImage(s3Object: S3Object): Promise<S3Object> {
    try {
      const result = await this.cloudRunEmotionService.analyzeByImageUrl(
        s3Object.url,
      );
      const emotions = getEmotionsAboveThreshold(result, 0.3);
      this.logger.info(
        `[HANDLE S3 IMAGE ANALYSIS RESULT] ${JSON.stringify(emotions)}`,
      );

      const tags = await Promise.all(
        emotions.map(async (emotion) => {
          return await this.s3ObjectTagService.createOrFind(
            CreateS3ObjectTagDto.fromJson({
              name: emotion.label,
              type: TagType.EMOTION,
              color: '#FFFFFF',
            }),
          );
        }),
      );

      s3Object.tags = [...s3Object.tags, ...tags];
      await this.awsS3Service.update(s3Object);
      this.logger.info(
        `[HANDLE S3 IMAGE ANALYSIS RESULT] ${JSON.stringify(s3Object.tags)}`,
      );
      return s3Object;
    } catch (error) {
      this.logger.error(
        `[ANALYZE IMAGE ERROR] ${s3Object.id}: ${error.message}`,
        error.stack,
      );
      return s3Object;
    }
  }

  /**
   * 비디오 파일 처리: 썸네일 생성 및 업로드
   * @param videoObject - 비디오 S3Object
   */
  async processVideo(
    appName: AwsS3AppNames,
    videoObject: S3Object,
  ): Promise<void> {
    try {
      this.logger.info(`[PROCESS VIDEO START] ${videoObject.id} ${appName}`);

      // 1. Cloud Run을 통해 썸네일 이미지 버퍼 및 감정 분석 결과 받기
      const thumbnailResponse =
        await this.cloudRunEmotionService.createThumbnailAndAnalyzeByVideoUrl(
          videoObject.url,
        );

      this.logger.info(
        `[THUMBNAIL RESPONSE] Size: ${thumbnailResponse.buffer.length} bytes, MimeType: ${thumbnailResponse.mimetype}, Emotion: ${thumbnailResponse.emotion}, Confidence: ${thumbnailResponse.confidence}, Filename: ${thumbnailResponse.filename}`,
      );

      // Buffer를 Express.Multer.File 형식으로 변환
      const thumbnailFile: Express.Multer.File = {
        buffer: thumbnailResponse.buffer,
        originalname: thumbnailResponse.filename || 'thumbnail.jpg',
        mimetype: thumbnailResponse.mimetype,
        size: thumbnailResponse.buffer.length,
        fieldname: 'file',
        encoding: '7bit',
        destination: '',
        filename: thumbnailResponse.filename || 'thumbnail.jpg',
        path: '',
        stream: null,
      };

      // 2. 썸네일 업로드 (uploadFile 사용, 이벤트 비활성화)
      const thumbnailObject = await this.awsS3Service.uploadFile(
        thumbnailFile,
        appName,
        videoObject.user,
        S3ObjectDestinationType.THUMBNAIL,
      );

      // 비디오와 썸네일 관계 설정
      videoObject.thumbnail = thumbnailObject;
      thumbnailObject.videoSource = videoObject;

      // 7. 저장
      await this.s3ObjectRepository.save([thumbnailObject, videoObject]);
      const object = await this.awsS3Service.findOneOrFail(videoObject.id);
      await this.awsS3Service.addTag(
        object,
        await this.s3ObjectTagService.createOrFind(
          CreateS3ObjectTagDto.fromJson({
            name: thumbnailResponse.emotion,
            type: TagType.EMOTION,
            color: '#FFFFFF',
          }),
        ),
      );
      this.logger.info(
        `[THUMBNAIL CREATED] Video: ${videoObject.id}, Thumbnail: ${thumbnailObject.id}, URL: ${thumbnailObject.url}, Emotion: ${thumbnailResponse.emotion}`,
      );
    } catch (error) {
      this.logger.error(
        `[PROCESS VIDEO ERROR] ${videoObject.id}: ${error.toString()}`,
      );
      // 에러가 발생해도 원본 비디오는 유지
    }
  }
}
