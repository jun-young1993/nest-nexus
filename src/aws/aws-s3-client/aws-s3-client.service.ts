import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { AwsRegion } from './enums/aws-region.enums';
import { ListObjectsQueryDto } from './dto/list-objects-query.dto';
import {
  ListObjectsResponseDto,
  S3ObjectItemDto,
} from './dto/list-objects-response.dto';

@Injectable()
export class AwsS3ClientService {
  private readonly clients: Map<AwsRegion, S3Client> = new Map();

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  getClient(region: AwsRegion): S3Client {
    const cachedClient = this.clients.get(region);
    if (cachedClient) {
      return cachedClient;
    }
    const accessKeyId = this.configService.get<string>(
      'awsS3Credentials.accessKeyId',
      { infer: true },
    );
    const secretAccessKey = this.configService.get<string>(
      'awsS3Credentials.secretAccessKey',
      { infer: true },
    );
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
    const client = this.getClient(params.region);
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
}
