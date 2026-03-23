import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class SubscriptionService {
  constructor(private firebaseService: FirebaseService) {}

  async grantPremium(appId: string, uid: string) {
    await this.firebaseService.getAuth(appId).setCustomUserClaims(uid, {
      isPremium: true,
    });

    return { success: true };
  }
}
