import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import {
  CreateVerificationCodeDto,
  VerifyCodeDto,
} from './dto/verification-code.dto';
import { MailerService } from '../mailer/mailer.service';
import { AppConfig } from 'src/app-config/entities/app-config.entity';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly mailerService: MailerService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getExpirationDate(): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5); // 5분 후 만료
    return date;
  }

  async createVerificationCode(
    dto: CreateVerificationCodeDto,
    appConfig: AppConfig,
  ): Promise<void> {
    // 기존 인증번호 비활성화
    await this.verificationCodeRepository.update(
      { email: dto.email, isVerified: false },
      { isVerified: true },
    );

    // 새 인증번호 생성
    const verificationCode = await this.verificationCodeRepository.save(
      this.verificationCodeRepository.create({
        email: dto.email,
        code: this.generateCode(),
        expiresAt: this.getExpirationDate(),
      }),
    );
    console.log(verificationCode);
    // 이메일 발송
    await this.mailerService.sendVerificationCode(
      dto.email,
      verificationCode,
      appConfig,
    );
  }

  async verifyCode(dto: VerifyCodeDto): Promise<boolean> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email: dto.email,
        code: dto.code,
        isVerified: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      throw new NotFoundException('인증번호를 찾을 수 없습니다.');
    }

    if (!verificationCode.isValid()) {
      throw new BadRequestException('만료되었거나 이미 사용된 인증번호입니다.');
    }

    verificationCode.isVerified = true;
    await this.verificationCodeRepository.save(verificationCode);

    return true;
  }

  async getLatestVerificationCode(email: string): Promise<VerificationCode> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      throw new NotFoundException('인증번호를 찾을 수 없습니다.');
    }

    return verificationCode;
  }
}
