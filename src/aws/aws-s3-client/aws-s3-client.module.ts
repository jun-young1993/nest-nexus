import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3ClientService } from './aws-s3-client.service';
import { AwsS3ClientController } from './aws-s3-client.controller';
import { AuthModule } from 'src/auth/auth.module';
import { S3Object } from '../s3/entities/s3-object.entity';
import { S3ObjectMetadata } from '../s3/entities/s3-object-metadata.entity';
import { S3ObjectMetadataService } from '../s3/s3-object-metadata.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TypeOrmModule.forFeature([S3Object, S3ObjectMetadata]),
  ],
  controllers: [AwsS3ClientController],
  providers: [AwsS3ClientService, S3ObjectMetadataService],
  exports: [AwsS3ClientService],
})
export class AwsS3ClientModule {}
