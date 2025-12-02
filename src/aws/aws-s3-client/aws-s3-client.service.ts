import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllConfigType, AwsS3AppNames } from 'src/config/config.type';
import { createNestLogger } from 'src/factories/logger.factory';
import { AwsRegion } from './enums/aws-region.enums';
import { ListObjectsQueryDto } from './dto/list-objects-query.dto';
import {
  ListObjectsResponseDto,
  S3ObjectItemDto,
} from './dto/list-objects-response.dto';
import { MigrateBucketQueryDto } from './dto/migrate-bucket-query.dto';
import { MigrateBucketResponseDto } from './dto/migrate-bucket-response.dto';
import { S3Object } from '../s3/entities/s3-object.entity';
import { S3ObjectMetadataService } from '../s3/s3-object-metadata.service';
import { S3ObjectDestinationType } from '../s3/enum/s3-object-destination.type';
import { getMimetypeFromFilename } from 'src/utils/file-type.util';
import { User } from 'src/user/entities/user.entity';
import { basename } from 'path';

@Injectable()
export class AwsS3ClientService {
  private readonly clients: Map<AwsRegion, S3Client> = new Map();
  private readonly logger = createNestLogger(AwsS3ClientService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
    private readonly s3ObjectMetadataService: S3ObjectMetadataService,
  ) {}

  getClient(appName: AwsS3AppNames): S3Client {
    const appConfig = this.configService.get<AllConfigType>(
      'awsS3Credentials',
      {
        infer: true,
      },
    ).awsS3AppConfig[appName];
    const region = appConfig.region;
    const accessKeyId = appConfig.accessKeyId;
    const secretAccessKey = appConfig.secretAccessKey;

    const cachedClient = this.clients.get(region);
    if (cachedClient) {
      return cachedClient;
    }

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    this.clients.set(region, client);
    return client;
  }

  async listObjects(
    params: ListObjectsQueryDto,
  ): Promise<ListObjectsResponseDto> {
    const client = this.getClient(params.appName);
    const command = new ListObjectsV2Command({
      Bucket: params.bucket,
      Prefix: params.prefix,
      ContinuationToken: params.continuationToken,
      MaxKeys: params.pageSize ?? 100,
      Delimiter: undefined,
    });
    const result = await client.send(command);
    const items: S3ObjectItemDto[] =
      result.Contents?.map((object) => ({
        key: object.Key ?? '',
        size: Number(object.Size ?? 0),
        lastModified: object.LastModified ?? new Date(0),
        storageClass: object.StorageClass ?? '',
      })) ?? [];
    return {
      items: items,
      nextContinuationToken: result.NextContinuationToken ?? null,
    };
  }

  async migrateBucket(
    params: MigrateBucketQueryDto,
    user: User,
  ): Promise<MigrateBucketResponseDto> {
    const client = this.getClient(params.appName);
    let totalObjects = 0;
    let existingObjects = 0;
    let migratedObjects = 0;
    let failedObjects = 0;
    let continuationToken: string | undefined = undefined;

    this.logger.log(
      `Starting migration for bucket: ${params.bucket}, prefix: ${params.prefix || 'all'}`,
    );

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: params.bucket,
        Prefix: params.prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const listResult = await client.send(listCommand);
      const objects = listResult.Contents || [];

      for (const s3Item of objects) {
        if (!s3Item.Key) {
          continue;
        }

        totalObjects++;

        try {
          // DB에 이미 존재하는지 확인 (key로)
          const existingObject = await this.s3ObjectRepository.findOne({
            where: {
              key: s3Item.Key,
              destination: S3ObjectDestinationType.UPLOAD,
              appName: params.appName,
            },
          });

          if (existingObject) {
            existingObjects++;
            this.logger.debug(`Object already exists: ${s3Item.Key}`);
            continue;
          }

          if (s3Item.Size === 0) {
            existingObjects++;
            this.logger.debug(`Object is empty: ${s3Item.Key}`);
            continue;
          }

          // 새 S3Object 생성
          const originalName = basename(s3Item.Key);
          const s3Object = this.s3ObjectRepository.create({
            key: s3Item.Key,
            originalName: originalName,
            size: Number(s3Item.Size ?? 0),
            mimetype:
              getMimetypeFromFilename(originalName) ||
              'application/octet-stream',
            user: user,
            appName: params.appName,
            destination: S3ObjectDestinationType.UPLOAD,
          });

          await this.s3ObjectRepository.save(s3Object);

          migratedObjects++;
          this.logger.log(`Migrated object: ${s3Item.Key}`);
        } catch (error) {
          failedObjects++;
          this.logger.error(
            `Failed to migrate object ${s3Item.Key}: ${error.message}`,
          );
        }
      }

      continuationToken = listResult.NextContinuationToken;
    } while (continuationToken);

    const result: MigrateBucketResponseDto = {
      totalObjects,
      existingObjects,
      migratedObjects,
      failedObjects,
    };

    this.logger.log(`Migration completed: ${JSON.stringify(result)}`);

    return result;
  }
}
