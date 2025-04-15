import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import * as firebaseAdmin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
@Injectable()
export class MyHomeParkingFcmService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const credential = configService.get('myHomeParkingFcm', { infer: true });
    // private key의 \\n을 실제 줄바꿈으로 변환
    const privateKey = credential.privateKey.replace(/\\n/g, '\n');
    credential.privateKey = privateKey;

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(credential),
    });
  }

  async sendMessage(message: MulticastMessage, dryRun?: boolean) {
    return firebaseAdmin.messaging().sendEachForMulticast(message, dryRun);
  }
}
