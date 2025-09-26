import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { AwsS3Controller } from './aws-s3.controller';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsS3Service } from './aws-s3.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Object } from './entities/s3-object.entity';
import { UserModule } from 'src/user/user.module';

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
        TypeOrmModule.forFeature([S3Object]),
      ],
      controllers: [AwsS3Controller],
      providers: [
        AwsS3Service,
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
      exports: [AwsS3Service, 'S3_CLIENT'],
    };
  }
}
