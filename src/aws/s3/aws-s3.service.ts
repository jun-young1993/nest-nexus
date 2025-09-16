import { S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  constructor(@Inject('S3_CLIENT') private readonly s3Client: S3Client) {}
}
