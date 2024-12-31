import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import { decrypt } from 'src/utils/crypto.util';

@Injectable()
export class OpenaiMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const isDev = this.configService.getOrThrow('app.is_dev');
    if (isDev) {
      return next();
    }
    const token = req.headers['x-access-token'];

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    try {
      const secretKey = this.configService.getOrThrow('app.secret_key');

      const decrypted = decrypt(token, secretKey);

      const [prefix, timestamp] = decrypted.split('-');

      if (secretKey === prefix) {
        const tokenTime = new Date(parseInt(timestamp, 10));
        const currentTime = new Date();
        const timeDifference =
          (currentTime.getTime() - tokenTime.getTime()) / 1000 / 60;

        if (timeDifference < 5 || this.configService.getOrThrow('app.is_dev')) {
          return next();
        } else {
          throw new UnauthorizedException('Invalid token: TimeOut');
        }
      }
      throw new UnauthorizedException('Invalid token: Prefix');
    } catch (error) {
      throw new UnauthorizedException('Invalid token: ' + error.toString());
    }
  }
}
