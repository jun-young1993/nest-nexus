import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { IsOptional, IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  APP_PORT: AppConfig['port'];

  @IsString()
  @IsOptional()
  APP_HOST: AppConfig['host'];

  @IsString()
  @IsOptional()
  HTTP_SSL_KEY: AppConfig['ssl_key'];

  @IsString()
  @IsOptional()
  HTTP_SSL_CERT: AppConfig['ssl_cert'];

  @IsString()
  NODE_ENV: AppConfig['node_env'];

  @IsString()
  APP_SECRET_KEY: AppConfig['secret_key'];

  @IsString()
  APP_DOMAIN: AppConfig['domain'];
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    host: process.env.APP_HOST,
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    ssl_cert: process.env.HTTP_SSL_KEY,
    ssl_key: process.env.HTTP_SSL_CERT,
    node_env: process.env.NODE_ENV as AppConfig['node_env'],
    is_dev: process.env.NODE_ENV === 'development',
    secret_key: process.env.APP_SECRET_KEY,
    domain: process.env.APP_DOMAIN,
  };
});
