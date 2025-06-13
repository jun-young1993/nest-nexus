import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/app-config/entities/app-config.entity';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationCode(
    to: string,
    verificationCode: string,
    appConfig: AppConfig,
  ): Promise<void> {
    const { displayName } = appConfig;
    await this.mailerService.sendMail({
      to,
      subject: `[${displayName}] 인증번호 안내`,
      template: 'verification-code.html',
      context: {
        verificationCode,
        displayName,
      },
    });
  }
}
