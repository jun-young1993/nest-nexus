import { IsString } from 'class-validator';
import { TranscoderConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { registerAs } from '@nestjs/config';

class EnvironmentVariablesValidator {
  @IsString()
  FFMPEG_PATH: TranscoderConfig['ffmpeg_path'];
  @IsString()
  FFPROBE_PATH: TranscoderConfig['ffprobe_path'];
}

export default registerAs<TranscoderConfig>('transcoder', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    ffmpeg_path: process.env.FFMPEG_PATH,
    ffprobe_path: process.env.FFPROBE_PATH,
  };
});
