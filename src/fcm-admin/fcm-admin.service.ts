import { Inject, Injectable } from '@nestjs/common';
import { FcmConfig } from 'src/config/config.type';

@Injectable()
export class FcmAdminService {
  private readonly fcmConfig: FcmConfig;
  constructor(
    @Inject('FcmAdminModule.FcmConfig') private readonly config: FcmConfig,
  ) {
    this.fcmConfig = config;
  }

  getConfig(): FcmConfig {
    return this.fcmConfig;
  }
}
