import validateConfig from 'src/utils/validate-config';
import { LoanScheduleFcmConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  LOAN_SCHEDULE_FCM_TYPE: LoanScheduleFcmConfig['type'];

  @IsString()
  LOAN_SCHEDULE_FCM_PROJECT_ID: LoanScheduleFcmConfig['projectId'];

  @IsString()
  LOAN_SCHEDULE_FCM_PRIVATE_KEY_ID: LoanScheduleFcmConfig['privateKeyId'];

  @IsString()
  LOAN_SCHEDULE_FCM_PRIVATE_KEY: LoanScheduleFcmConfig['privateKey'];

  @IsString()
  LOAN_SCHEDULE_FCM_CLIENT_EMAIL: LoanScheduleFcmConfig['clientEmail'];

  @IsString()
  LOAN_SCHEDULE_FCM_CLIENT_ID: LoanScheduleFcmConfig['clientId'];

  @IsString()
  LOAN_SCHEDULE_FCM_AUTH_URI: LoanScheduleFcmConfig['authUri'];

  @IsString()
  LOAN_SCHEDULE_FCM_TOKEN_URI: LoanScheduleFcmConfig['tokenUri'];

  @IsString()
  LOAN_SCHEDULE_FCM_AUTH_PROVIDER_X509_CERT_URL: LoanScheduleFcmConfig['authProviderX509CertUrl'];

  @IsString()
  LOAN_SCHEDULE_FCM_CLIENT_X509_CERT_URL: LoanScheduleFcmConfig['clientX509CertUrl'];

  @IsString()
  LOAN_SCHEDULE_FCM_UNIVERSE_DOMAIN: LoanScheduleFcmConfig['universeDomain'];
}

export default registerAs<LoanScheduleFcmConfig>('loanScheduleFcm', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    type: process.env.LOAN_SCHEDULE_FCM_TYPE,
    projectId: process.env.LOAN_SCHEDULE_FCM_PROJECT_ID,
    privateKeyId: process.env.LOAN_SCHEDULE_FCM_PRIVATE_KEY_ID,
    privateKey: process.env.LOAN_SCHEDULE_FCM_PRIVATE_KEY,
    clientEmail: process.env.LOAN_SCHEDULE_FCM_CLIENT_EMAIL,
    clientId: process.env.LOAN_SCHEDULE_FCM_CLIENT_ID,
    authUri: process.env.LOAN_SCHEDULE_FCM_AUTH_URI,
    tokenUri: process.env.LOAN_SCHEDULE_FCM_TOKEN_URI,
    authProviderX509CertUrl:
      process.env.LOAN_SCHEDULE_FCM_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.LOAN_SCHEDULE_FCM_CLIENT_X509_CERT_URL,
    universeDomain: process.env.LOAN_SCHEDULE_FCM_UNIVERSE_DOMAIN,
  };
});
