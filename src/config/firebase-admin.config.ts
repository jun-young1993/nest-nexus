import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { FirebaseAdminConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  FIREBAE_ADMIN_SERVICE_ACCOUNT_KEYS_PATH: string;
}

export default registerAs<FirebaseAdminConfig>('firebaseAdmin', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    serviceAccountKeysPath: process.env.FIREBAE_ADMIN_SERVICE_ACCOUNT_KEYS_PATH,
  };
});
