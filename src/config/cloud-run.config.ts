import { IsString, ValidateNested } from 'class-validator';
import { CloudRunConfig, CloudRunEmotionConfig } from './config.type';
import { Type } from 'class-transformer';
import { registerAs } from '@nestjs/config';
import validateConfig from 'src/utils/validate-config';

class CloudRunEmotionConfigValidator {
  @IsString()
  key_path: CloudRunEmotionConfig['key_path'];
  @IsString()
  base_url: CloudRunEmotionConfig['base_url'];
}

class EnvironmentVariablesValidator {
  @ValidateNested()
  @Type(() => CloudRunEmotionConfigValidator)
  emotion: CloudRunEmotionConfig;
}

export default registerAs<CloudRunConfig>('cloudRun', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    emotion: {
      key_path: process.env.CLOUD_RUN_EMOTION_KEY_PATH,
      base_url: process.env.CLOUD_RUN_EMOTION_BASE_URL,
    },
  };
});
