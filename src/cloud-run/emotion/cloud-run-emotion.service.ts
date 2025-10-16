import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { GoogleAuth } from 'google-auth-library';
import { AllConfigType } from 'src/config/config.type';
import { createNestLogger } from 'src/factories/logger.factory';
import { EmotionAnalysisResponse } from './interfaces/emotion-analysis-response.interface';

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

  async createThumbnailAndAnalyzeByVideoUrl(
    videoUrl: string,
  ): Promise<EmotionAnalysisResponse> {
    try {
      const baseUrl = this.configService.get('cloudRun.emotion.base_url', {
        infer: true,
      });
      const idToken = await this.getAccessToken();

      // Make request to Cloud Run service with ID token
      const response = await lastValueFrom(
        this.httpService.post<EmotionAnalysisResponse>(
          `${baseUrl}/thumbnail`,
          { url: videoUrl },
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
}
