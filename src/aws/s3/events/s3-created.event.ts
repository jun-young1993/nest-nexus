import { AwsS3AppNames } from 'src/config/config.type';
import { S3Object } from '../entities/s3-object.entity';

export class S3CreatedEvent {
  constructor(
    public readonly appName: AwsS3AppNames,
    public readonly s3Object: S3Object,
  ) {}
}
