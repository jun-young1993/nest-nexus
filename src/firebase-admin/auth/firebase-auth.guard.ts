import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.replace('Bearer ', '');
    const appId = request.headers['x-app-id'];

    if (!token || !appId) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = await this.firebaseService
        .getAuth(appId)
        .verifyIdToken(token);

      request.user = decoded;
      request.appId = appId;

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
