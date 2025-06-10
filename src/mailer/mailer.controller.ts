import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { VerificationCodeDto } from './dto/verification-code.dto';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '목표 진행 알림 이메일 테스트' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이메일이 성공적으로 발송됨',
  })
  async test(): Promise<{ message: string }> {
    await this.mailerService.test();
    return { message: '목표 진행 알림 이메일이 발송되었습니다.' };
  }

  @Post('test/invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '목표 초대 이메일 테스트' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이메일이 성공적으로 발송됨',
  })
  async testGoalInvitationEmail(
    @Body()
    body: {
      to: string;
      goalTitle: string;
      inviterName: string;
      invitationLink: string;
    },
  ): Promise<{ message: string }> {
    await this.mailerService.sendGoalInvitation(
      body.to,
      body.goalTitle,
      body.inviterName,
      body.invitationLink,
    );
    return { message: '목표 초대 이메일이 발송되었습니다.' };
  }

  @Post('test/reminder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '목표 리마인더 이메일 테스트' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이메일이 성공적으로 발송됨',
  })
  async testGoalReminderEmail(
    @Body()
    body: {
      to: string;
      goalTitle: string;
      daysLeft: number;
    },
  ): Promise<{ message: string }> {
    await this.mailerService.sendGoalReminder(
      body.to,
      body.goalTitle,
      body.daysLeft,
    );
    return { message: '목표 리마인더 이메일이 발송되었습니다.' };
  }

  @Post('test/verification')
  @ApiOperation({ summary: '인증번호 이메일 테스트' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  async testVerificationEmail(
    @Body() body: VerificationCodeDto,
  ): Promise<void> {
    await this.mailerService.sendVerificationCode(
      body.to,
      body.verificationCode,
    );
  }
}
