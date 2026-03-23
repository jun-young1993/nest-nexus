import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseApps } from './firebase.provider';

@Injectable()
export class FirebaseService {
  getApp(appId: string): admin.app.App {
    const app = firebaseApps[appId];

    if (!app) {
      throw new Error(`Firebase app not found: ${appId}`);
    }

    return app;
  }

  getAuth(appId: string) {
    return this.getApp(appId).auth();
  }
}
