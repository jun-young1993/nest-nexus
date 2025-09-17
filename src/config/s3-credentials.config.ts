import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AwsS3CredentialsConfig, AwsS3AppConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { registerAs } from '@nestjs/config';

class AwsS3AppConfigValidator {
  @IsString()
  region: string;

  @IsString()
  bucket: string;
}

class EnvironmentVariablesValidator {
  @IsString()
  AWS_S3_ACCESS_KEY_ID: AwsS3CredentialsConfig['accessKeyId'];

  @IsString()
  AWS_S3_SECRET_ACCESS_KEY: AwsS3CredentialsConfig['secretAccessKey'];

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
        region: 'us-east-1',
        bucket: 'juny-babylog-assets',
      },
    },
  };
});
