export type AppConfig = {
  host: string;
  port: number;
  ssl_key?: string;
  ssl_cert?: string;
  node_env: 'development' | 'production';
  is_dev: boolean;
  secret_key: string;
  domain: string;
};
export type AlieConfig = {
  url: string;
  auth_callback_url: string;
  app_key: string;
  app_secret: string;
  access_token: string;
};

export type GithubConfig = {
  access_token: string;
};

export type GptConfig = {
  key: string;
  organization: string;
  project_id: string;
};

export type LogConfig = {
  dir: string;
};

export type GeminiConfig = {
  key: string;
};

export type DbConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
};

export type FcmConfig = {
  type: string;
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  authUri: string;
  tokenUri: string;
  authProviderX509CertUrl: string;
  clientX509CertUrl: string;
  universeDomain: string;
};

export type MyHomeParkingFcmConfig = FcmConfig;

export type LoanScheduleFcmConfig = FcmConfig;

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  from: string;
};

type AwsS3AppByConfig = {
  region: 'us-east-1';
  bucket: 'juny-babylog-assets';
};

export type AwsS3AppNames = 'baby-log';

export interface AwsS3AppConfig
  extends Record<AwsS3AppNames, AwsS3AppByConfig> {
  'baby-log': AwsS3AppByConfig;
}

export type AwsS3CredentialsConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  awsS3AppConfig: AwsS3AppConfig;
};

export type CloudRunEmotionConfig = {
  key_path: string;
  base_url: string;
};

export type CloudRunConfig = {
  emotion: CloudRunEmotionConfig;
};

export type LibreTranslateConfig = {
  ip: string;
  port: number;
  languages: string;
  use: boolean;
};

export type AiConfig = {
  libreTranslate: LibreTranslateConfig;
};

export type AllConfigType = {
  app: AppConfig;
  alie: AlieConfig;
  github: GithubConfig;
  gpt: GptConfig;
  log: LogConfig;
  gemini: GeminiConfig;
  db: DbConfig;
  myHomeParkingFcm: MyHomeParkingFcmConfig;
  loanScheduleFcm: LoanScheduleFcmConfig;
  awsS3Credentials: AwsS3CredentialsConfig;
  cloudRun: CloudRunConfig;
  ai: AiConfig;
};
