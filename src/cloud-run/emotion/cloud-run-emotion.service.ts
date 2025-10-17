import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { GoogleAuth } from 'google-auth-library';
import { AllConfigType } from 'src/config/config.type';
import { createNestLogger } from 'src/factories/logger.factory';
import { EmotionAnalysisResponse } from './interfaces/emotion-analysis-response.interface';
import { VideoThumbnailResponse } from './interfaces/video-thumbnail-response.interface';

@Injectable()
export class CloudRunEmotionService {
  private googleAuth: GoogleAuth;
  private readonly logger = createNestLogger(CloudRunEmotionService.name);
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
  ) {
    const keyPath = this.configService.get('cloudRun.emotion.key_path', {
      infer: true,
    });
    this.googleAuth = new GoogleAuth({
      keyFile: keyPath,
    });
  }

  async getAccessToken() {
    // Get ID token for Cloud Run service
    const baseUrl = this.configService.get('cloudRun.emotion.base_url', {
      infer: true,
    });
    const client = await this.googleAuth.getIdTokenClient(baseUrl);
    const idToken = await client.idTokenProvider.fetchIdToken(baseUrl);
    this.logger.info(`[GET ACCESS TOKEN] ${idToken}`);
    return idToken;
  }

  async index() {
    try {
      const baseUrl = this.configService.get('cloudRun.emotion.base_url', {
        infer: true,
      });
      const idToken = await this.getAccessToken();

      // Make request to Cloud Run service with ID token
      const response = await lastValueFrom(
        this.httpService.get(baseUrl, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status =
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Cloud Run Emotion API Error';

        throw new HttpException(message, status);
      }
      throw error;
    }
  }

  async analyzeByImageUrl(imageUrl: string): Promise<EmotionAnalysisResponse> {
    try {
      const baseUrl = this.configService.get('cloudRun.emotion.base_url', {
        infer: true,
      });
      const idToken = await this.getAccessToken();

      // Make request to Cloud Run service with ID token
      const response = await lastValueFrom(
        this.httpService.post<EmotionAnalysisResponse>(
          `${baseUrl}/predict`,
          { url: imageUrl },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status =
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Cloud Run Emotion API Error';

        throw new HttpException(message, status);
      }
      throw error;
    }
  }

  /**
   * 비디오 URL로부터 썸네일 이미지 생성 및 다운로드
   * @param videoUrl - 비디오 URL
   * @returns 썸네일 이미지 버퍼 및 감정 분석 결과
   */
  async createThumbnailAndAnalyzeByVideoUrl(
    videoUrl: string,
  ): Promise<VideoThumbnailResponse> {
    try {
      const baseUrl = this.configService.get('cloudRun.emotion.base_url', {
        infer: true,
      });
      const idToken = await this.getAccessToken();

      // Make request to Cloud Run service with ID token
      // responseType을 arraybuffer로 설정하여 이미지 바이너리 수신
      const response = await lastValueFrom(
        this.httpService.post(
          `${baseUrl}/thumbnail`,
          { url: videoUrl },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            responseType: 'arraybuffer', // 이미지 바이너리 수신
          },
        ),
      );

      // 응답 헤더에서 정보 추출
      const contentType = response.headers['content-type'] as
        | string
        | undefined;
      const emotion = response.headers['x-emotion'] as string | undefined;
      const confidenceStr = response.headers['x-confidence'] as
        | string
        | undefined;
      const contentDisposition = response.headers['content-disposition'] as
        | string
        | undefined;

      // MIME 타입 결정 (Content-Type 헤더 우선, 없으면 기본값)
      const mimetype = contentType || 'image/jpeg';

      // confidence를 숫자로 변환
      const confidence = confidenceStr ? parseFloat(confidenceStr) : undefined;

      // Content-Disposition에서 파일명 추출
      let filename: string | undefined;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      this.logger.info(
        `[THUMBNAIL CREATED] MimeType: ${mimetype}, Emotion: ${emotion}, Confidence: ${confidence}, Filename: ${filename}`,
      );

      return {
        buffer: Buffer.from(response.data),
        mimetype,
        emotion,
        confidence,
        filename,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status =
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Cloud Run Emotion API Error';

        throw new HttpException(message, status);
      }
      throw error;
    }
  }
}
