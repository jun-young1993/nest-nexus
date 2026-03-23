import * as admin from 'firebase-admin';

export const firebaseApps = {
  dayly: admin.initializeApp(
    {
      //   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    },
    'dayly',
  ),
};
