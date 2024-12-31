import { IsString } from 'class-validator';
import { GeminiConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  GEMINI_API_KEY: GeminiConfig['key'];
}

export default registerAs<GeminiConfig>('gemini', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    key: process.env.GEMINI_API_KEY,
  };
});
