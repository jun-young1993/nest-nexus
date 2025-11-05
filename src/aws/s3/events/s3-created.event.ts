import { S3Object } from '../entities/s3-object.entity';

export class S3CreatedEvent {
  constructor(public readonly s3Object: S3Object) {}
}
