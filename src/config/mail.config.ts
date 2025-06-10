import { IsPort, IsString } from 'class-validator';
import { MailConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import validateConfig from '../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  MAIL_HOST: MailConfig['host'];
  @IsPort()
  MAIL_PORT: MailConfig['port'];
  @IsString()
  MAIL_SECURE: MailConfig['secure'];
  @IsString()
  MAIL_USER: MailConfig['user'];
  @IsString()
  MAIL_PASSWORD: MailConfig['pass'];
  @IsString()
  MAIL_FROM_NAME: MailConfig['fromName'];
  @IsString()
  MAIL_FROM: MailConfig['from'];
}

export default registerAs<MailConfig>('mail', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
    fromName: process.env.MAIL_FROM_NAME,
    from: process.env.MAIL_FROM,
  };
});
