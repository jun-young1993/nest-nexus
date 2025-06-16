declare global {
  namespace NodeJs {
    interface ProcessEnv {
      DB_TYPE: 'mysql';
      DB_LOGGING: boolean;
    }
  }
}
export {};
