import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async test() {
    console.log(this.configService.get('mail', { infer: true }));
    console.log(this.mailerService);
    await await this.mailerService.sendMail({
      to: 'juny3738@gmail.com',
      subject: `[Subject] test`,
      template: 'test.html',
      context: {
        goalTitle: 'test',
        progress: {
          date: '2025-06-07',
          isCompleted: true,
          rank: 1,
          title: 'test',
          description: 'hi',
          formattedDate: '2025-06-07',
        },
      },
    });
  }

  async sendGoalProgressNotification(
    to: string,
    goalTitle: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `[목표 진행 알림] ${goalTitle}`,
      template: 'goal-progress.html',
      context: {
        goalTitle,
        progress: {
          date: '2025-06-07',
          isCompleted: true,
          rank: 1,
          title: 'test',
          description: 'hi',
        },
      },
    });
  }

  async sendGoalInvitation(
    to: string,
    goalTitle: string,
    inviterName: string,
    invitationLink: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `[목표 초대] ${goalTitle}`,
      template: 'goal-invitation.html',
      context: {
        goalTitle,
        inviterName,
        invitationLink,
      },
    });
  }

  async sendGoalReminder(
    to: string,
    goalTitle: string,
    daysLeft: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `[목표 리마인더] ${goalTitle}`,
      template: 'goal-reminder.html',
      context: {
        goalTitle,
        daysLeft,
      },
    });
  }

  async sendVerificationCode(
    to: string,
    verificationCode: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: '[Nest-Nexus] 인증번호 안내',
      template: 'verification-code.html',
      context: {
        verificationCode,
      },
    });
  }
}
