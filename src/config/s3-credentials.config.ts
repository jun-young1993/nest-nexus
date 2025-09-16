import { IsString } from 'class-validator';
import { AwsS3CredentialsConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { registerAs } from '@nestjs/config';

class EnvironmentVariablesValidator {
  @IsString()
  AWS_S3_ACCESS_KEY_ID: AwsS3CredentialsConfig['accessKeyId'];
  @IsString()
  AWS_S3_SECRET_ACCESS_KEY: AwsS3CredentialsConfig['secretAccessKey'];
}

export default registerAs<AwsS3CredentialsConfig>('awsS3Credentials', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  };
});
