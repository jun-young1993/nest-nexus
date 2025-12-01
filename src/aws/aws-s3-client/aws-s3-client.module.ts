import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsS3ClientService } from './aws-s3-client.service';
import { AwsS3ClientController } from './aws-s3-client.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AwsS3ClientController],
  providers: [AwsS3ClientService],
  exports: [AwsS3ClientService],
})
export class AwsS3ClientModule {}
