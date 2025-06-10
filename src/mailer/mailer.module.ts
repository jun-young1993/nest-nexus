import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mail.host', { infer: true }),
          port: configService.get<number>('mail.port', { infer: true }),
          secure: configService.get<boolean>('mail.secure', { infer: true }),
          auth: {
            user: configService.get<string>('mail.user', { infer: true }),
            pass: configService.get<string>('mail.pass', { infer: true }),
          },
        },
        defaults: {
          from: `"${configService.get<string>('mail.fromName', { infer: true })}" <${configService.get<string>('mail.from', { infer: true })}>`,
        },
        template: {
          dir: join(process.cwd(), 'dist/mailer/templates'),
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
          }),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
