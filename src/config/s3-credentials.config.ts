import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AwsS3CredentialsConfig, AwsS3AppConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { AwsRegion } from 'src/aws/aws-s3-client/enums/aws-region.enums';

class AwsS3AppConfigValidator {
  @IsString()
  region: string;

  @IsString()
  bucket: string;

  @IsString()
  accessKeyId: string;

  @IsString()
  secretAccessKey: string;
}

class EnvironmentVariablesValidator {
  @ValidateNested()
  @Type(() => AwsS3AppConfigValidator)
  AWS_S3_APP_CONFIG: AwsS3AppConfig;
}

export default registerAs<AwsS3CredentialsConfig>('awsS3Credentials', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    awsS3AppConfig: {
      'baby-log': {
        region: AwsRegion.US_EAST_1,
        bucket: 'juny-babylog-assets',
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
      'young-young-family-assets': {
        region: AwsRegion.AP_NORTHEAST_2,
        bucket: 'young-young-family-assets',
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    },
  };
});
