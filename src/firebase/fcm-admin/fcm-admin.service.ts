import { Inject, Injectable } from '@nestjs/common';
import { FcmConfig } from 'src/config/config.type';
import * as firebaseAdmin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FcmAdminService {
  private readonly fcmConfig: FcmConfig;
  constructor(
    @Inject('FcmAdminModule.FcmConfig') private readonly config: FcmConfig,
  ) {
    const privateKey = config.privateKey.replace(/\\n/g, '\n');
    config.privateKey = privateKey;

    this.fcmConfig = config;

    firebaseAdmin.initializeApp(
      {
        credential: firebaseAdmin.credential.cert(this.fcmConfig),
      },
      config.projectId,
    );
  }

  getConfig(): FcmConfig {
    return this.fcmConfig;
  }

  async sendMessage(message: MulticastMessage, dryRun?: boolean) {
    if (message.tokens.length === 0) {
      throw new Error('FCM 토큰이 없습니다.');
    }
    return firebaseAdmin.messaging().sendEachForMulticast(message, dryRun);
  }
}
