import { IsString, ValidateNested } from 'class-validator';
import {
  CloudRunBaseConfig,
  CloudRunConfig,
  CloudRunDeepFaceConfig,
  CloudRunEmotionConfig,
} from './config.type';
import { Type } from 'class-transformer';
import { registerAs } from '@nestjs/config';
import validateConfig from 'src/utils/validate-config';

class CloudRunBaseConfigValidator {
  @IsString()
  key_path: CloudRunBaseConfig['key_path'];
  @IsString()
  base_url: CloudRunBaseConfig['base_url'];
}

class CloudRunEmotionConfigValidator extends CloudRunBaseConfigValidator {}

class CloudRunDeepFaceConfigValidator extends CloudRunBaseConfigValidator {}

class CloudRunAiHubConfigValidator {
  @ValidateNested()
  @Type(() => CloudRunDeepFaceConfigValidator)
  deepFace: CloudRunDeepFaceConfig;
}

class EnvironmentVariablesValidator {
  @ValidateNested()
  @Type(() => CloudRunEmotionConfigValidator)
  emotion: CloudRunEmotionConfig;

  @ValidateNested()
  @Type(() => CloudRunAiHubConfigValidator)
  aiHub: {
    deepFace: CloudRunDeepFaceConfig;
  };
}

export default registerAs<CloudRunConfig>('cloudRun', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    emotion: {
      key_path: process.env.CLOUD_RUN_EMOTION_KEY_PATH,
      base_url: process.env.CLOUD_RUN_EMOTION_BASE_URL,
    },
    aiHub: {
      deepFace: {
        key_path: process.env.CLOUD_RUN_DEEP_FACE_KEY_PATH,
        base_url: process.env.CLOUD_RUN_DEEP_FACE_BASE_URL,
      },
    },
  };
});
