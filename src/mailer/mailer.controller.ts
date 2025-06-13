import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { VerificationCodeDto } from './dto/verification-code.dto';
import { AppConfigService } from 'src/app-config/app-config.service';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Post('verification')
  @ApiOperation({ summary: '인증번호 이메일 테스트' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  async testVerificationEmail(
    @Body() body: VerificationCodeDto,
  ): Promise<void> {
    const appConfig = await this.appConfigService.findOneByKey(body.appKey);

    await this.mailerService.sendVerificationCode(
      body.to,
      body.verificationCode,
      appConfig,
    );
  }
}
