export type AppConfig = {
  host: string;
  port: number;
  ssl_key?: string;
  ssl_cert?: string;
  node_env: 'development' | 'production';
  is_dev: boolean;
  secret_key: string;
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
export type MyHomeParkingFcmConfig = {
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

export type AllConfigType = {
  app: AppConfig;
  alie: AlieConfig;
  github: GithubConfig;
  gpt: GptConfig;
  log: LogConfig;
  gemini: GeminiConfig;
  db: DbConfig;
  myHomeParkingFcm: MyHomeParkingFcmConfig;
};
