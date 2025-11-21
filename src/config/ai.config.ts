import { registerAs } from '@nestjs/config';
import { AiConfig, LibreTranslateConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { IsPort, IsString } from 'class-validator';
class EnvironmentVariablesValidator {
  @IsString()
  LIBRE_TRANSLATE_IP: LibreTranslateConfig['ip'];
  @IsPort()
  LIBRE_TRANSLATE_PORT: LibreTranslateConfig['port'];
  @IsString()
  LIBRE_TRANSLATE_LANGUAGES: LibreTranslateConfig['languages'];
  @IsString()
  LIBRE_TRANSLATE_USE: LibreTranslateConfig['use'];
}
export default registerAs<AiConfig>('ai', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    libreTranslate: {
      ip: process.env.LIBRE_TRANSLATE_IP,
      port: parseInt(process.env.LIBRE_TRANSLATE_PORT),
      languages: process.env.LIBRE_TRANSLATE_LANGUAGES,
      use: process.env.LIBRE_TRANSLATE_USE === 'true' ? true : false,
    },
  };
});
