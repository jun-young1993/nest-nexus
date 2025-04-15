import validateConfig from 'src/utils/validate-config';
import { MyHomeParkingFcmConfig } from './config.type';
import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  MY_HOME_PARKING_FCM_TYPE: MyHomeParkingFcmConfig['type'];

  @IsString()
  MY_HOME_PARKING_FCM_PROJECT_ID: MyHomeParkingFcmConfig['projectId'];

  @IsString()
  MY_HOME_PARKING_FCM_PRIVATE_KEY_ID: MyHomeParkingFcmConfig['privateKeyId'];

  @IsString()
  MY_HOME_PARKING_FCM_PRIVATE_KEY: MyHomeParkingFcmConfig['privateKey'];

  @IsString()
  MY_HOME_PARKING_FCM_CLIENT_EMAIL: MyHomeParkingFcmConfig['clientEmail'];

  @IsString()
  MY_HOME_PARKING_FCM_CLIENT_ID: MyHomeParkingFcmConfig['clientId'];

  @IsString()
  MY_HOME_PARKING_FCM_AUTH_URI: MyHomeParkingFcmConfig['authUri'];

  @IsString()
  MY_HOME_PARKING_FCM_TOKEN_URI: MyHomeParkingFcmConfig['tokenUri'];

  @IsString()
  MY_HOME_PARKING_FCM_AUTH_PROVIDER_X509_CERT_URL: MyHomeParkingFcmConfig['authProviderX509CertUrl'];

  @IsString()
  MY_HOME_PARKING_FCM_CLIENT_X509_CERT_URL: MyHomeParkingFcmConfig['clientX509CertUrl'];

  @IsString()
  MY_HOME_PARKING_FCM_UNIVERSE_DOMAIN: MyHomeParkingFcmConfig['universeDomain'];
}

export default registerAs<MyHomeParkingFcmConfig>('myHomeParkingFcm', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    type: process.env.MY_HOME_PARKING_FCM_TYPE,
    projectId: process.env.MY_HOME_PARKING_FCM_PROJECT_ID,
    privateKeyId: process.env.MY_HOME_PARKING_FCM_PRIVATE_KEY_ID,
    privateKey: process.env.MY_HOME_PARKING_FCM_PRIVATE_KEY,
    clientEmail: process.env.MY_HOME_PARKING_FCM_CLIENT_EMAIL,
    clientId: process.env.MY_HOME_PARKING_FCM_CLIENT_ID,
    authUri: process.env.MY_HOME_PARKING_FCM_AUTH_URI,
    tokenUri: process.env.MY_HOME_PARKING_FCM_TOKEN_URI,
    authProviderX509CertUrl:
      process.env.MY_HOME_PARKING_FCM_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.MY_HOME_PARKING_FCM_CLIENT_X509_CERT_URL,
    universeDomain: process.env.MY_HOME_PARKING_FCM_UNIVERSE_DOMAIN,
  };
});
