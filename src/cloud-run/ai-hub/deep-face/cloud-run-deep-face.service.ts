import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { GoogleAuth } from 'google-auth-library';
import { AllConfigType } from 'src/config/config.type';
import { createNestLogger } from 'src/factories/logger.factory';
import * as FormData from 'form-data';
import { getMimetypeFromFilename } from 'src/utils/file-type.util';
import * as path from 'path';
import { User } from 'src/user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudRunDeepFaceService {
  private googleAuth: GoogleAuth;
  private readonly logger = createNestLogger(CloudRunDeepFaceService.name);
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
  ) {
    const keyPath = this.configService.get('cloudRun.aiHub.deepFace.key_path', {
      infer: true,
    });

    this.googleAuth = new GoogleAuth({
      keyFile: keyPath,
    });
  }
  async getAccessToken() {
    // Get ID token for Cloud Run service
    const baseUrl = this.configService.get('cloudRun.aiHub.deepFace.base_url', {
      infer: true,
    });
    const client = await this.googleAuth.getIdTokenClient(baseUrl);
    const idToken = await client.idTokenProvider.fetchIdToken(baseUrl);
    return idToken;
  }

  /**
   * 임시 파일 업로드
   *
   *
   * @param filePath - 업로드할 파일 경로
   * @param dirPath - 저장할 디렉토리 경로 (기본값: 'storage')
   * @returns 업로드 결과
   */
  async uploadTemp(files: Express.Multer.File[], user: User): Promise<any> {
    try {
      const dirPath = `storage/${user.id}`;
      this.logger.info(`[UPLOAD TEMP FILE START] ${files} to ${dirPath}`);
      const baseUrl = this.configService.get(
        'cloudRun.aiHub.deepFace.base_url',
        {
          infer: true,
        },
      );
      const idToken = await this.getAccessToken();

      // 파일 존재 여부 확인
      if (!files.length) {
        throw new HttpException(`Files not found`, HttpStatus.NOT_FOUND);
      }

      // FormData 생성
      const formData = new FormData();
      formData.append('dir_path', dirPath);
      files.forEach((file) => {
        const filename =
          uuidv4() + path.extname(file.originalname || file.filename || '');
        const contentType = getMimetypeFromFilename(
          file.originalname || file.filename || '',
        );
        formData.append('files', file.buffer, {
          filename,
          contentType,
        });
      });

      // Cloud Run 서비스에 요청
      const response = await lastValueFrom(
        this.httpService.post(`${baseUrl}/files/temp`, formData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
            ...formData.getHeaders(),
          },
        }),
      );

      this.logger.info(
        `[UPLOAD TEMP FILE SUCCESS] ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`[UPLOAD TEMP FILE ERROR] ${error}`);
      if (error instanceof AxiosError) {
        const status =
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Cloud Run Deep Face API Error';

        throw new HttpException(message, status);
      }
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(_file: Express.Multer.File, _user: User) {
    const baseUrl = this.configService.get('cloudRun.aiHub.deepFace.base_url', {
      infer: true,
    });
    const idToken = await this.getAccessToken();
    const response = await lastValueFrom(
      this.httpService.post(`${baseUrl}/find`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }),
    );
    return response.data;
  }
}
