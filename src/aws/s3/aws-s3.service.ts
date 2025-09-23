import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { AllConfigType, AwsS3AppNames } from 'src/config/config.type';
import { S3Object } from './entities/s3-object.entity';
import { FindManyOptions, Repository, Between } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getDatesInMonth } from 'src/utils/date/date-range-loop';

@Injectable()
export class AwsS3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    appName: AwsS3AppNames,
    user: User,
  ): Promise<S3Object> {
    try {
      const s3Object = await this.s3ObjectRepository.save(
        this.s3ObjectRepository.create({
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          user: user,
        }),
      );

      const awsS3CredentialsConfig = this.configService.get<AllConfigType>(
        'awsS3Credentials',
        {
          infer: true,
        },
      );
      const appConfig = this.configService.get<AllConfigType>('app', {
        infer: true,
      });
      if (!awsS3CredentialsConfig.awsS3AppConfig[appName]) {
        throw new Error(`알 수 없는 앱 이름: ${appName}`);
      }

      const nodeEnv = appConfig.node_env;
      if (!nodeEnv) {
        throw new Error('NODE_ENV가 설정되지 않았습니다.');
      }
      const bucket = awsS3CredentialsConfig.awsS3AppConfig[appName].bucket;
      const region = awsS3CredentialsConfig.awsS3AppConfig[appName].region;

      const extension = extname(file.originalname);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      // 파일명 생성 개선
      const key = `${nodeEnv}/${year}/${month}/${day}/${s3Object.id}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);
      s3Object.url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      s3Object.active = true;
      s3Object.key = key;
      await this.s3ObjectRepository.save(s3Object);
      return s3Object;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      throw new Error(`파일 업로드 실패: ${error.message}`);
    }
  }

  async uploaFiles(
    files: Express.Multer.File[],
    appName: AwsS3AppNames,
    user: User,
  ): Promise<S3Object[]> {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file, appName, user);
      results.push(result);
    }
    return results;
  }

  async getObjects(
    user: User,
    options: FindManyOptions<S3Object>,
  ): Promise<S3Object[]> {
    // 방법 1: userId로 조회
    const result = await this.s3ObjectRepository.find({
      where: {
        user: { id: user.id }, // 관계를 통한 조회
      },
      order: { createdAt: 'DESC' },
      ...options,
    });

    return result;
  }

  async findOneOrFail(id: string): Promise<S3Object> {
    return await this.s3ObjectRepository.findOneOrFail({ where: { id } });
  }

  async count(user: User): Promise<number> {
    return await this.s3ObjectRepository.count({
      where: {
        user: { id: user.id }, // 관계를 통한 조회
      },
    });
  }

  async getObjectsByDate(
    user: User,
    year: string,
    month: string,
    day: string,
  ): Promise<S3Object[]> {
    // 해당 날짜의 시작과 끝 시간 계산
    const startDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      0,
      0,
      0,
    );
    const endDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      23,
      59,
      59,
    );

    return await this.s3ObjectRepository.find({
      where: {
        user: { id: user.id },
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 해당 월의 모든 날짜에 대한 객체 존재 여부 체크
   * @param year - 년도 (YYYY)
   * @param month - 월 (MM)
   * @param user - 현재 사용자
   * @returns 해당 월의 날짜별 객체 존재 여부
   */
  async checkObjectsExistenceByMonth(
    year: string,
    month: string,
    user: User,
  ): Promise<Record<string, boolean>> {
    // 유틸리티 함수를 사용하여 해당 월의 모든 날짜 생성
    const dates = getDatesInMonth(year, month);

    // 기존의 checkObjectsExistenceByDates 메서드 활용
    return await this.checkObjectsExistenceByDates(dates, user);
  }

  /**
   * 날짜별 S3 객체 존재 여부 체크 (createdAt 기반 - 인덱스 최적화)
   * @param dates - 체크할 날짜 배열 (YYYY-MM-DD 형식)
   * @param user - 현재 사용자
   * @returns 날짜별 존재 여부 객체
   */
  async checkObjectsExistenceByDates(
    dates: string[],
    user: User,
  ): Promise<Record<string, boolean>> {
    // 최고 성능: createdAt 범위 조건 사용 (인덱스 활용)
    const existenceChecks = await Promise.all(
      dates.map(async (date) => {
        // 날짜 범위 계산 (2025-09-24 00:00:00 ~ 2025-09-24 23:59:59)
        const startDate = new Date(date + ' 00:00:00');
        const endDate = new Date(date + ' 23:59:59');

        const exists = await this.s3ObjectRepository
          .createQueryBuilder('s3')
          .select('1')
          .where('s3.userId = :userId', { userId: user.id })
          .andWhere('s3.createdAt >= :startDate', { startDate })
          .andWhere('s3.createdAt <= :endDate', { endDate })
          .limit(1)
          .getRawOne();

        return {
          date,
          exists: !!exists,
        };
      }),
    );

    // 결과를 객체 형태로 변환
    return existenceChecks.reduce(
      (acc, { date, exists }) => {
        acc[date] = exists;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }
}
