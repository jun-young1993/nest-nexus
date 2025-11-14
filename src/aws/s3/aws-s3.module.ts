import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { AwsS3Controller } from './aws-s3.controller';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsS3Service } from './aws-s3.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Object } from './entities/s3-object.entity';
import { S3ObjectTag } from './entities/s3-object-tag.entity';
import { S3ObjectTagController } from './s3-object-tag.controller';
import { S3ObjectTagService } from './s3-object-tag.service';
import { S3ObjectReply } from './entities/s3-object-reply.entity';
import { S3ObjectLike } from './entities/s3-object-like.entity';
import { S3ObjectLikeController } from './s3-object-like.controller';
import { S3ObjectLikeService } from './s3-object-like.service';
import { S3ObjectReplyController } from './s3-object-reply.controller';
import { S3ObjectReplyService } from './s3-object-reply.service';
import { S3ObjectReport } from './entities/s3-object-report.entity';
import { S3ObjectReplyReport } from './entities/s3-object-reply-report.entity';
import { S3ObjectReportController } from './s3-object-report.controller';
import { S3ObjectReportService } from './s3-object-report.service';
import { S3ObjectReplyReportService } from './s3-object-reply-report.service';
import { UserModule } from 'src/user/user.module';
import { S3ObjectReplyReportController } from './s3-object-reply-report.controller';
import { S3ObjectScopeService } from './s3-object-scope.service';
import { S3ObjectQueryService } from './s3-object-query.service';
import { CloudRunEmotionModule } from 'src/cloud-run/emotion/cloud-run-emotion.module';
import { CloudRunEmotionService } from 'src/cloud-run/emotion/cloud-run-emotion.service';
import { S3CreatedListener } from './listeners/s3-created.listener';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { S3_OBJECT_CACHE_KEY } from './aws-s3.constants';

@Module({})
export class AwsS3Module {
  /**
   * 동적으로 S3 설정을 받아서 모듈을 생성합니다.
   */
  static forRoot(config?: { region?: string }): DynamicModule {
    return {
      module: AwsS3Module,
      imports: [
        ConfigModule,
        AuthModule,
        UserModule,
        TypeOrmModule.forFeature([
          S3Object,
          S3ObjectTag,
          S3ObjectReply,
          S3ObjectLike,
          S3ObjectReport,
          S3ObjectReplyReport,
        ]),
        CloudRunEmotionModule,
        CacheModule.register({ ttl: 1000 * 60 * 60 * 24 }),
      ],
      controllers: [
        AwsS3Controller,
        S3ObjectTagController,
        S3ObjectLikeController,
        S3ObjectReplyController,
        S3ObjectReportController,
        S3ObjectReplyReportController,
      ],
      providers: [
        AwsS3Service,
        S3ObjectTagService,
        S3ObjectLikeService,
        S3ObjectReplyService,
        S3ObjectReportService,
        S3ObjectReplyReportService,
        S3ObjectScopeService,
        S3ObjectQueryService,
        CloudRunEmotionService,
        S3CreatedListener,
        {
          provide: S3_OBJECT_CACHE_KEY,
          useClass: CacheInterceptor,
        },
        {
          provide: 'S3_CLIENT',
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return new S3Client({
              region: config?.region || 'us-east-1',
              credentials: {
                accessKeyId: configService.get<string>(
                  'awsS3Credentials.accessKeyId',
                  { infer: true },
                ),
                secretAccessKey: configService.get<string>(
                  'awsS3Credentials.secretAccessKey',
                  { infer: true },
                ),
              },
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: [
        AwsS3Service,
        'S3_CLIENT',
        S3ObjectTagService,
        S3ObjectLikeService,
        S3ObjectReplyService,
        S3ObjectReportService,
        S3ObjectReplyReportService,
        S3ObjectScopeService,
        S3ObjectQueryService,
        CloudRunEmotionService,
        S3CreatedListener,
      ],
    };
  }
}
