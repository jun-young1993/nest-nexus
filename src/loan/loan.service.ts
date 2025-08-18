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
import * as financial from 'financial';

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

      await this.generatePaymentSchedules(savedLoan);

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

  async findOneOrFail(id: string, userId: string): Promise<Loan> {
    const loan = await this.findOne(id, userId);
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
    const loan = await this.findOneOrFail(id, userId);

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
    const loan = await this.findOneOrFail(loanId, userId);

    // console.log(loan);
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
      // await this.recalculatePaymentSchedules(loan.id);

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
   * 상환 계획표 자동 생성
   * 대출 상환 방식에 따라 월별 상환 계획을 계산하여 생성
   */
  private async generatePaymentSchedules(loan: Loan): Promise<void> {
    const schedules: Partial<PaymentSchedule>[] = [];
    const totalMonths = loan.term;
    const monthlyRate = loan.interestRate; // 월 이자율

    // 대출 시작일 기준으로 월 상환일 계산
    const paymentDay = loan.paymentDay || loan.startDate.getDate();

    for (let month = 1; month <= totalMonths; month++) {
      const paymentDate = this.calculatePaymentDate(
        loan.startDate,
        month,
        paymentDay,
      );

      let principalAmount: number;
      let interestAmount: number;
      let totalAmount: number;
      let remainingBalance: number;

      switch (loan.repaymentType) {
        case RepaymentType.EQUAL_INSTALLMENT:
          // 원리금균등상환: 매월 동일한 금액
          const monthlyPayment = this.calculateEqualInstallment(
            loan.amount,
            monthlyRate,
            totalMonths,
          );

          // 남은 원금 계산
          const remainingPrincipal = this.calculateRemainingPrincipal(
            loan.amount,
            monthlyRate,
            month - 1,
            monthlyPayment,
          );

          principalAmount =
            remainingPrincipal -
            this.calculateRemainingPrincipal(
              loan.amount,
              monthlyRate,
              month,
              monthlyPayment,
            );

          interestAmount = monthlyPayment - principalAmount;
          totalAmount = monthlyPayment;
          remainingBalance = this.calculateRemainingPrincipal(
            loan.amount,
            monthlyRate,
            month,
            monthlyPayment,
          );
          break;

        case RepaymentType.EQUAL_PRINCIPAL:
          // 원금균등상환: 매월 원금은 동일, 이자는 감소
          principalAmount = loan.amount / totalMonths;
          remainingBalance = loan.amount - principalAmount * month;
          interestAmount = remainingBalance * monthlyRate;
          totalAmount = principalAmount + interestAmount;
          break;

        case RepaymentType.BULLET_PAYMENT:
          // 만기일시상환: 만기까지 이자만, 원금은 만기에
          if (month === totalMonths) {
            // 마지막 달: 원금 + 이자
            principalAmount = loan.amount;
            interestAmount = loan.amount * monthlyRate;
            totalAmount = principalAmount + interestAmount;
            remainingBalance = 0;
          } else {
            // 중간 달: 이자만
            principalAmount = 0;
            interestAmount = loan.amount * monthlyRate;
            totalAmount = interestAmount;
            remainingBalance = loan.amount;
          }
          break;

        default:
          throw new BadRequestException(
            `Unsupported repayment type: ${loan.repaymentType}`,
          );
      }

      schedules.push({
        loanId: loan.id,
        paymentNumber: month,
        paymentDate,
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        totalAmount: Math.round(totalAmount),
        remainingBalance: Math.round(remainingBalance),
        status: PaymentStatus.PENDING,
        actualPaidAmount: 0,
        lateFee: 0,
      });
    }

    // 상환 계획표 일괄 저장
    await this.paymentScheduleRepository.save(schedules);
  }

  /**
   * 원리금균등상환 월 상환금 계산
   * financial 라이브러리의 pmt 함수 사용
   */
  private calculateEqualInstallment(
    principal: number,
    monthlyRate: number,
    totalMonths: number,
  ): number {
    if (monthlyRate === 0) {
      return principal / totalMonths;
    }

    // financial.pmt(rate, nper, pv, fv, type)
    // rate: 이자율, nper: 기간, pv: 현재가치(원금), fv: 미래가치, type: 지급시점
    const monthlyPayment = (financial as any).pmt(
      monthlyRate,
      totalMonths,
      -principal,
      0,
      0,
    );
    return Math.abs(monthlyPayment); // 음수로 반환되므로 절댓값 처리
  }

  /**
   * 원리금균등상환에서 특정 시점의 남은 원금 계산
   */
  private calculateRemainingPrincipal(
    principal: number,
    monthlyRate: number,
    month: number,
    monthlyPayment: number,
  ): number {
    if (month === 0) return principal;
    if (monthlyRate === 0) return principal - monthlyPayment * month;

    // financial.fv(rate, nper, pmt, pv, type)
    // rate: 이자율, nper: 기간, pmt: 지급금액, pv: 현재가치, type: 지급시점
    const futureValue = (financial as any).fv(
      monthlyRate,
      month,
      monthlyPayment,
      -principal,
      0,
    );
    return Math.abs(futureValue);
  }

  /**
   * 월 상환일 계산
   * 대출 시작일 기준으로 매월 동일한 날짜 계산
   */
  private calculatePaymentDate(
    startDate: Date,
    monthOffset: number,
    paymentDay: number,
  ): Date {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + monthOffset);

    // 해당 월의 마지막 날보다 paymentDay가 크면 마지막 날로 조정
    const lastDayOfMonth = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth() + 1,
      0,
    ).getDate();
    const adjustedDay = Math.min(paymentDay, lastDayOfMonth);

    paymentDate.setDate(adjustedDay);
    return paymentDate;
  }

  /**
   * 대출 상환 진행률 계산
   */
  async calculateRepaymentProgress(
    loanId: string,
    userId: string,
  ): Promise<{
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    progressPercentage: number;
    completedPayments: number;
    totalPayments: number;
  }> {
    const loan = await this.findOne(loanId, userId);
    const schedules = await this.paymentScheduleRepository.find({
      where: { loanId },
      order: { paymentNumber: 'ASC' },
    });

    const totalAmount = schedules.reduce(
      (sum, schedule) => sum + schedule.totalAmount,
      0,
    );
    const paidAmount = schedules.reduce(
      (sum, schedule) => sum + schedule.actualPaidAmount,
      0,
    );
    const remainingAmount = totalAmount - paidAmount;
    const progressPercentage = (paidAmount / totalAmount) * 100;
    const completedPayments = schedules.filter(
      (s) => s.status === PaymentStatus.PAID,
    ).length;
    const totalPayments = schedules.length;

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      progressPercentage,
      completedPayments,
      totalPayments,
    };
  }

  /**
   * 대출 이자 총액 계산
   */
  async calculateTotalInterest(
    loanId: string,
    userId: string,
  ): Promise<number> {
    const schedules = await this.paymentScheduleRepository.find({
      where: { loanId },
    });

    return schedules.reduce(
      (sum, schedule) => sum + schedule.interestAmount,
      0,
    );
  }

  /**
   * 대출 조기상환 시 상환 계획 재계산
   */
  async recalculatePaymentSchedules(
    loanId: string,
    userId: string,
    prepaymentAmount: number,
    prepaymentDate: Date,
  ): Promise<void> {
    const loan = await this.findOne(loanId, userId);

    // 조기상환 후 남은 원금 계산
    const currentBalance = await this.getCurrentBalance(loanId);
    const newBalance = currentBalance - prepaymentAmount;

    if (newBalance <= 0) {
      throw new BadRequestException(
        'Prepayment amount exceeds current balance',
      );
    }

    // 조기상환 시점 이후의 상환 계획만 재계산
    const remainingSchedules = await this.paymentScheduleRepository.find({
      where: {
        loanId,
        paymentDate: { $gte: prepaymentDate } as any,
      },
      order: { paymentNumber: 'ASC' },
    });

    // 남은 원금과 기간으로 새로운 상환 계획 계산
    const remainingMonths = remainingSchedules.length;
    const monthlyRate = loan.interestRate / 100 / 12;

    for (let i = 0; i < remainingMonths; i++) {
      const schedule = remainingSchedules[i];

      let principalAmount: number;
      let interestAmount: number;
      let totalAmount: number;
      let remainingBalance: number;

      switch (loan.repaymentType) {
        case RepaymentType.EQUAL_INSTALLMENT:
          const monthlyPayment = this.calculateEqualInstallment(
            newBalance,
            monthlyRate,
            remainingMonths,
          );

          const remainingPrincipal = this.calculateRemainingPrincipal(
            newBalance,
            monthlyRate,
            i,
            monthlyPayment,
          );

          principalAmount =
            remainingPrincipal -
            this.calculateRemainingPrincipal(
              newBalance,
              monthlyRate,
              i + 1,
              monthlyPayment,
            );

          interestAmount = monthlyPayment - principalAmount;
          totalAmount = monthlyPayment;
          remainingBalance = this.calculateRemainingPrincipal(
            newBalance,
            monthlyRate,
            i + 1,
            monthlyPayment,
          );
          break;

        case RepaymentType.EQUAL_PRINCIPAL:
          principalAmount = newBalance / remainingMonths;
          remainingBalance = newBalance - principalAmount * (i + 1);
          interestAmount = remainingBalance * monthlyRate;
          totalAmount = principalAmount + interestAmount;
          break;

        case RepaymentType.BULLET_PAYMENT:
          if (i === remainingMonths - 1) {
            principalAmount = newBalance;
            interestAmount = newBalance * monthlyRate;
            totalAmount = principalAmount + interestAmount;
            remainingBalance = 0;
          } else {
            principalAmount = 0;
            interestAmount = newBalance * monthlyRate;
            totalAmount = interestAmount;
            remainingBalance = newBalance;
          }
          break;
      }

      // 상환 계획 업데이트
      await this.paymentScheduleRepository.update(schedule.id, {
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        totalAmount: Math.round(totalAmount),
        remainingBalance: Math.round(remainingBalance),
      });
    }
  }

  /**
   * 현재 대출 잔액 조회
   */
  private async getCurrentBalance(loanId: string): Promise<number> {
    const latestSchedule = await this.paymentScheduleRepository.findOne({
      where: { loanId },
      order: { paymentNumber: 'DESC' },
    });

    return latestSchedule ? latestSchedule.remainingBalance : 0;
  }
}
