import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import { VerificationCodeService } from './verification-code.service';
import { VerificationCodeController } from './verification-code.controller';
import { MailerModule } from '../mailer/mailer.module';
import { AppConfigModule } from 'src/app-config/app-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode]),
    MailerModule,
    AppConfigModule,
  ],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
