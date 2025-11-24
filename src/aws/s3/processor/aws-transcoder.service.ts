import { Injectable } from '@nestjs/common';

import { S3LowResProcessorInterface } from '../interfaces/s3-low-res-processor.interface';

import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import * as ffmpeg from 'fluent-ffmpeg';

import { AwsS3Service } from '../aws-s3.service';
import {
  existsSync,
  mkdirSync,
  createWriteStream,
  unlinkSync,
  createReadStream,
} from 'fs';
import * as path from 'path';
import { FileType } from 'src/utils/file-type.util';
import { createNestLogger } from 'src/factories/logger.factory';
import { pipeline } from 'stream/promises';
import { streamToBuffer } from 'src/utils/stremes/strem-to-buffer';
import { S3ObjectDestinationType } from '../enum/s3-object-destination.type';

@Injectable()
export class AwsTranscoderService {
  private readonly logger = createNestLogger(AwsTranscoderService.name);
  constructor(
    // @InjectQueue(AwsS3QueueName.AWS_TRANSCORDER) private transcoderQueue: Queue,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly awsS3Service: AwsS3Service,
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
    const { s3Object } = jobOption;
    this.logger.info(
      `GENERATELOWRES S3 OBJECT ID: ${s3Object.id} START PROCESS`,
    );
    if (!s3Object.extension) {
      this.logger.error(
        `GENERATELOWRES S3 OBJECT ID: ${s3Object.id} HAS NO EXTENSION`,
      );
      throw new Error('S3 객체에 확장자를 찾을 수 없습니다.');
    }
    if (s3Object.fileType !== FileType.VIDEO) {
      this.logger.error(
        `GENERATELOWRES S3 OBJECT ID: ${s3Object.id} IS NOT A VIDEO FILE`,
      );
      throw new Error('S3 객체는 비디오 파일이 아닙니다.');
    }

    // const job = await this.transcoderQueue.add(
    //   AwsS3JobName.GENERATE_LOW_RES,
    //   jobOption,
    // );
    this.generateLowResProcess(jobOption);
  }

  async generateLowResProcess(jobOption: S3LowResProcessorInterface) {
    const { s3Object } = jobOption;
    const size = '360x?';
    const readable = await this.awsS3Service.getObjectCommand(s3Object);
    const assetsDir = this.configService.getOrThrow('app.assets_dir', {
      infer: true,
    });
    // 파일명에서 사용할 수 없는 문자 제거/치환
    const sanitizedSize = size
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/x\?/g, 'x');
    const lowResPath = path.join(
      assetsDir,
      'low-res',
      `${s3Object.id}-${sanitizedSize}.mp4`,
    );
    const lowResDir = path.dirname(lowResPath);
    const tempDir = path.join(assetsDir, 'temp');
    const tempInputPath = path.join(
      tempDir,
      `${s3Object.id}-input${s3Object.extension}`,
    );

    // 디렉토리 생성
    if (!existsSync(lowResDir)) {
      mkdirSync(lowResDir, { recursive: true });
    }
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const extension = s3Object.extension;

    try {
      // 스트림을 임시 파일로 저장 (더 안정적인 처리)
      this.logger.info(
        `GENERATELOWRESPROCESS S3 OBJECT ID: ${s3Object.id} DOWNLOADING TO TEMP FILE`,
      );
      const tempWriteStream = createWriteStream(tempInputPath);
      await pipeline(readable, tempWriteStream);
      this.logger.info(
        `GENERATELOWRESPROCESS S3 OBJECT ID: ${s3Object.id} TEMP FILE CREATED`,
      );

      // 임시 파일로부터 인코딩
      return new Promise<void>((resolve, reject) => {
        this.logger.info(
          `GENERATELOWRESPROCESS S3 OBJECT ID: ${s3Object.id} START ENCODING`,
        );
        const ffmpegCommand = ffmpeg()
          .input(tempInputPath)
          .inputFormat(extension)
          .size(size)
          .videoCodec('libx264')
          .audioCodec('aac')
          .audioFrequency(44100) // 오디오 샘플레이트 (표준)
          .audioBitrate('128k')
          .outputOptions([
            '-preset medium', // fast보다 품질 우선, veryfast보다 느림
            '-crf 23', // 품질 설정 (18-28 권장, 낮을수록 고품질)
            '-maxrate 1500k', // 최대 비트레이트 제한
            '-bufsize 4000k', // 버퍼 크기 (maxrate의 2배 권장)
            '-movflags +faststart', // 웹 재생 최적화 (메타데이터를 파일 앞부분에 배치)
            '-pix_fmt yuv420p', // 호환성을 위한 픽셀 포맷 (대부분의 플레이어 지원)
            '-profile:v high', // baseline보다 품질 좋음, 대부분의 디바이스 지원
            '-level 4.0', // 더 높은 해상도/프레임레이트 지원
            '-r 30', // 출력 프레임레이트 제한 (고프레임레이트 영상 처리)
            '-g 30', // GOP 크기 (프레임레이트와 동일하게)
            '-sc_threshold 0', // 씬 체인지 감지 비활성화 (일관된 품질)
            '-force_key_frames expr:gte(n,n_forced*2)', // 키프레임 간격 제어
          ])
          .output(lowResPath)
          .on('start', (commandLine) => {
            this.logger.debug(`FFmpeg command: ${commandLine}`);
          })
          .on('progress', (progress) => {
            this.logger.debug(
              `Processing: ${progress.percent}% done (${progress.timemark})`,
            );
          })
          .on('end', async () => {
            this.logger.info(
              `GENERATELOWRESPROCESS S3 OBJECT ID: ${s3Object.id} END PROCESS`,
            );
            const readable = createReadStream(lowResPath);
            const buffer = await streamToBuffer(readable);
            const thumbnailFile: Express.Multer.File = {
              buffer: buffer,
              originalname: `${s3Object.id}-low-res.mp4`,
              mimetype: 'video/mp4',
              size: buffer.length,
              fieldname: 'file',
              encoding: '7bit',
              destination: '',
              filename: `${s3Object.id}-low-res.mp4`,
              path: '',
              stream: null,
            };
            const lowResObject = await this.awsS3Service.uploadFile(
              thumbnailFile,
              s3Object.appName,
              s3Object.user,
              S3ObjectDestinationType.LOW_RES,
            );
            s3Object.lowRes = lowResObject;
            lowResObject.lowResSource = s3Object;
            await this.awsS3Service.update(lowResObject);
            await this.awsS3Service.update(s3Object);
            // 임시 파일 삭제
            try {
              if (existsSync(tempInputPath)) {
                unlinkSync(tempInputPath);
                this.logger.debug(`Temp file deleted: ${tempInputPath}`);
              }
              if (existsSync(lowResPath)) {
                unlinkSync(lowResPath);
                this.logger.debug(`Low res file deleted: ${lowResPath}`);
              }
            } catch (error) {
              this.logger.warn(
                `Failed to delete temp file: ${error.toString()}`,
              );
            }
            resolve();
          })
          .on('error', (error) => {
            this.logger.error(
              `GENERATELOWRESPROCESS S3 OBJECT ID: ${s3Object.id} ERROR: ${error.toString()}`,
            );
            // 에러 발생 시에도 임시 파일 삭제 시도
            try {
              if (existsSync(tempInputPath)) {
                unlinkSync(tempInputPath);
                this.logger.debug(`Temp file deleted: ${tempInputPath}`);
              }
              if (existsSync(lowResPath)) {
                unlinkSync(lowResPath);
                this.logger.debug(`Low res file deleted: ${lowResPath}`);
              }
            } catch (deleteError) {
              // 무시
            }
            reject(error);
          });

        ffmpegCommand.run();
      });
    } catch (error) {
      // 다운로드 실패 시 임시 파일 삭제
      try {
        if (existsSync(tempInputPath)) {
          unlinkSync(tempInputPath);
        }
        if (existsSync(lowResPath)) {
          unlinkSync(lowResPath);
        }
      } catch (deleteError) {
        // 무시
      }
      throw error;
    }
  }
}
