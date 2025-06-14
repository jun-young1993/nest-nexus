import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerificationCodeService } from './verification-code.service';
import {
  CreateVerificationCodeDto,
  VerifyCodeDto,
} from './dto/verification-code.dto';
import { AppConfigService } from 'src/app-config/app-config.service';
import { VerificationCode } from './entities/verification-code.entity';
import { UserService } from 'src/user/user.service';

@ApiTags('Verification')
@Controller('verification')
export class VerificationCodeController {
  constructor(
    private readonly verificationCodeService: VerificationCodeService,
    private readonly appConfigService: AppConfigService,
    private readonly userService: UserService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증번호 발송' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '인증번호가 이메일로 발송됨',
  })
  async sendVerificationCode(
    @Body() dto: CreateVerificationCodeDto,
  ): Promise<VerificationCode> {
    const appConfig = await this.appConfigService.findOneByKey(dto.appKey);
    const verificationCode =
      await this.verificationCodeService.createVerificationCode(dto, appConfig);
    verificationCode.code = '********';
    verificationCode.id = '********';
    return verificationCode;
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증번호 확인' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '인증번호 확인 성공',
  })
  async verifyCode(@Body() dto: VerifyCodeDto): Promise<{ message: string }> {
    await this.verificationCodeService.verifyCode(dto);
    await this.userService.updateUser(dto.userId, { email: dto.email });
    return { message: '인증번호가 확인되었습니다.' };
  }

  @Get('latest/:email')
  @ApiOperation({ summary: '최근 인증번호 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '최근 인증번호 정보 반환',
  })
  async getLatestVerificationCode(@Param('email') email: string) {
    return this.verificationCodeService.getLatestVerificationCode(email);
  }
}
