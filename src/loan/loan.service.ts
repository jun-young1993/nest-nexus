import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Loan, LoanStatus, RepaymentType } from './entities/loan.entity';
import {
  PaymentSchedule,
  PaymentStatus,
} from './entities/payment-schedule.entity';
import { Prepayment, PrepaymentStatus } from './entities/prepayment.entity';
import { LoanAnalytics } from './entities/loan-analytics.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { CreatePrepaymentDto } from './dto/create-prepayment.dto';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(PaymentSchedule)
    private readonly paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(Prepayment)
    private readonly prepaymentRepository: Repository<Prepayment>,
    @InjectRepository(LoanAnalytics)
    private readonly loanAnalyticsRepository: Repository<LoanAnalytics>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 대출 생성
   */
  async create(createLoanDto: CreateLoanDto, userId: string): Promise<Loan> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`대출 생성 시작: ${userId}`);
      // 대출 생성
      const loan = this.loanRepository.create({
        ...createLoanDto,
        userId,
        endDate: this.calculateEndDate(
          createLoanDto.startDate,
          createLoanDto.term,
        ),
      });

      const savedLoan = await this.loanRepository.save(loan);

      // await this.generatePaymentSchedules(savedLoan);

      await queryRunner.commitTransaction();

      return savedLoan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`대출 생성 실패: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 사용자의 대출 목록 조회
   */
  async findAllByUserId(userId: string): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { userId, isActive: true },
      // relations: ['paymentSchedules', 'prepayments'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 대출 상세 조회
   */
  async findOne(id: string, userId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, userId, isActive: true },
      relations: ['paymentSchedules', 'prepayments', 'analytics'],
    });

    if (!loan) {
      throw new NotFoundException('대출을 찾을 수 없습니다.');
    }

    return loan;
  }

  /**
   * 대출 정보 수정
   */
  async update(
    id: string,
    updateLoanDto: UpdateLoanDto,
    userId: string,
  ): Promise<Loan> {
    const loan = await this.findOne(id, userId);

    // 대출 상태가 완료되거나 취소된 경우 수정 불가
    if (
      loan.status === LoanStatus.COMPLETED ||
      loan.status === LoanStatus.CANCELLED
    ) {
      throw new BadRequestException(
        '완료되거나 취소된 대출은 수정할 수 없습니다.',
      );
    }

    Object.assign(loan, updateLoanDto);

    if (updateLoanDto.startDate && updateLoanDto.term) {
      loan.endDate = this.calculateEndDate(
        updateLoanDto.startDate,
        updateLoanDto.term,
      );
    }

    const updatedLoan = await this.loanRepository.save(loan);
    this.logger.log(`대출 수정 완료: ${id}`);

    return updatedLoan;
  }

  /**
   * 대출 삭제 (소프트 삭제)
   */
  async remove(id: string, userId: string): Promise<void> {
    const loan = await this.findOne(id, userId);

    loan.isActive = false;
    loan.deletedAt = new Date();

    await this.loanRepository.save(loan);
    this.logger.log(`대출 삭제 완료: ${id}`);
  }

  /**
   * 상환 스케줄 조회
   */
  async getPaymentSchedules(
    loanId: string,
    userId: string,
  ): Promise<PaymentSchedule[]> {
    await this.findOne(loanId, userId); // 대출 존재 확인

    return this.paymentScheduleRepository.find({
      where: { loanId },
      order: { paymentNumber: 'ASC' },
    });
  }

  /**
   * 상환 스케줄 생성
   */
  async createPaymentSchedule(
    loanId: string,
    createScheduleDto: CreatePaymentScheduleDto,
    userId: string,
  ): Promise<PaymentSchedule> {
    await this.findOne(loanId, userId); // 대출 존재 확인

    const schedule = this.paymentScheduleRepository.create({
      ...createScheduleDto,
      loanId,
    });

    return this.paymentScheduleRepository.save(schedule);
  }

  /**
   * 상환 스케줄 수정
   */
  async updatePaymentSchedule(
    loanId: string,
    scheduleId: string,
    updateData: Partial<CreatePaymentScheduleDto>,
    userId: string,
  ): Promise<PaymentSchedule> {
    await this.findOne(loanId, userId); // 대출 존재 확인

    const schedule = await this.paymentScheduleRepository.findOne({
      where: { id: scheduleId, loanId },
    });

    if (!schedule) {
      throw new NotFoundException('상환 스케줄을 찾을 수 없습니다.');
    }

    Object.assign(schedule, updateData);
    return this.paymentScheduleRepository.save(schedule);
  }

  /**
   * 상환 스케줄 삭제
   */
  async removePaymentSchedule(
    loanId: string,
    scheduleId: string,
    userId: string,
  ): Promise<void> {
    await this.findOne(loanId, userId); // 대출 존재 확인

    const schedule = await this.paymentScheduleRepository.findOne({
      where: { id: scheduleId, loanId },
    });

    if (!schedule) {
      throw new NotFoundException('상환 스케줄을 찾을 수 없습니다.');
    }

    await this.paymentScheduleRepository.remove(schedule);
  }

  /**
   * 중도상환 목록 조회
   */
  async getPrepayments(loanId: string, userId: string): Promise<Prepayment[]> {
    await this.findOne(loanId, userId); // 대출 존재 확인

    return this.prepaymentRepository.find({
      where: { loanId },
      relations: ['schedules'],
      order: { prepaymentDate: 'DESC' },
    });
  }

  /**
   * 중도상환 생성
   */
  async createPrepayment(
    loanId: string,
    createPrepaymentDto: CreatePrepaymentDto,
    userId: string,
  ): Promise<Prepayment> {
    const loan = await this.findOne(loanId, userId);

    // 중도상환 금액이 잔액을 초과하는지 확인
    if (createPrepaymentDto.amount > loan.remainingBalance) {
      throw new BadRequestException(
        '중도상환 금액이 대출 잔액을 초과할 수 없습니다.',
      );
    }

    const prepayment = this.prepaymentRepository.create({
      ...createPrepaymentDto,
      loanId,
    });

    return this.prepaymentRepository.save(prepayment);
  }

  /**
   * 중도상환 적용
   */
  async applyPrepayment(
    prepaymentId: string,
    userId: string,
  ): Promise<Prepayment> {
    const prepayment = await this.prepaymentRepository.findOne({
      where: { id: prepaymentId },
      relations: ['loan'],
    });

    if (!prepayment) {
      throw new NotFoundException('중도상환을 찾을 수 없습니다.');
    }

    if (prepayment.loan.userId !== userId) {
      throw new BadRequestException('권한이 없습니다.');
    }

    if (prepayment.status !== PrepaymentStatus.PENDING) {
      throw new BadRequestException('이미 처리된 중도상환입니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 중도상환 상태 변경
      prepayment.status = PrepaymentStatus.APPLIED;
      await this.prepaymentRepository.save(prepayment);

      // 대출 정보 업데이트
      const loan = prepayment.loan;
      loan.totalPaidAmount += prepayment.amount;
      await this.loanRepository.save(loan);

      // 상환 스케줄 재계산
      await this.recalculatePaymentSchedules(loan.id);

      await queryRunner.commitTransaction();
      this.logger.log(`중도상환 적용 완료: ${prepaymentId}`);

      return prepayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`중도상환 적용 실패: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 대출 만기일 계산
   */
  private calculateEndDate(startDate: Date, termYears: number): Date {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);
    return endDate;
  }

  /**
   * 상환 스케줄 생성
   */
  private async generatePaymentSchedules(loan: Loan): Promise<void> {
    const schedules: Partial<PaymentSchedule>[] = [];
    const monthlyRate = loan.interestRate / 100;
    const totalMonths = loan.term;
    let remainingBalance = loan.amount;

    for (let month = 1; month <= totalMonths; month++) {
      let principalAmount: number;
      let interestAmount: number;
      let totalAmount: number;

      if (loan.repaymentType === RepaymentType.EQUAL_INSTALLMENT) {
        // 원리금균등상환
        totalAmount = this.calculateEqualInstallment(
          loan.amount,
          monthlyRate,
          totalMonths,
        );
        interestAmount = remainingBalance * monthlyRate;
        principalAmount = totalAmount - interestAmount;
      } else if (loan.repaymentType === RepaymentType.EQUAL_PRINCIPAL) {
        // 원금균등상환
        principalAmount = loan.amount / totalMonths;
        interestAmount = remainingBalance * monthlyRate;
        totalAmount = principalAmount + interestAmount;
      } else {
        // 만기일시상환
        principalAmount = month === totalMonths ? remainingBalance : 0;
        interestAmount = remainingBalance * monthlyRate;
        totalAmount = principalAmount + interestAmount;
      }

      const paymentDate = new Date(loan.startDate);
      paymentDate.setMonth(paymentDate.getMonth() + month);

      schedules.push({
        paymentNumber: month,
        paymentDate,
        principalAmount,
        interestAmount,
        totalAmount,
        remainingBalance: remainingBalance - principalAmount,
        status: PaymentStatus.PENDING,
        loanId: loan.id,
      });

      remainingBalance -= principalAmount;
    }

    await this.paymentScheduleRepository.save(schedules);
  }

  /**
   * 원리금균등상환 계산
   */
  private calculateEqualInstallment(
    principal: number,
    monthlyRate: number,
    totalMonths: number,
  ): number {
    if (monthlyRate === 0) return principal / totalMonths;

    const rate = monthlyRate;
    const n = totalMonths;
    return (
      (principal * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1)
    );
  }

  /**
   * 상환 스케줄 재계산 (중도상환 후)
   */
  private async recalculatePaymentSchedules(loanId: string): Promise<void> {
    // 중도상환이 적용된 후 상환 스케줄을 재계산하는 로직
    // 이 부분은 복잡한 금융 계산이 필요하므로 기본 구조만 제공
    this.logger.log(`상환 스케줄 재계산: ${loanId}`);
  }
}
