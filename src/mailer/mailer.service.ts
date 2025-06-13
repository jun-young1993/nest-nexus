import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/app-config/entities/app-config.entity';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationCode(
    to: string,
    verificationCode: VerificationCode,
    appConfig: AppConfig,
  ): Promise<void> {
    const { displayName } = appConfig;
    const { code, expiresAt } = verificationCode;
    await this.mailerService.sendMail({
      to,
      subject: `[${displayName}] 인증번호 안내 - ${code}`,
      template: 'verification-code.html',
      context: {
        verificationCode: code,
        expiresAt,
        displayName,
      },
    });
  }
}
