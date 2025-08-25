import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
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
import {
  LoanRepaymentSummaryDto,
  MonthlyRepaymentSummary,
} from './dto/loan-repayment-summary.dto';

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
        startDate: new Date(createLoanDto.startDate),
        endDate: this.calculateEndDate(
          new Date(createLoanDto.startDate),
          createLoanDto.term,
        ),
        isActive: false,
      });

      const savedLoan = await this.loanRepository.save(loan);

      this.generatePaymentSchedules(savedLoan);

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
  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, isActive: true },
      // relations: ['paymentSchedules', 'prepayments', 'analytics'],
    });

    if (!loan) {
      throw new NotFoundException('대출을 찾을 수 없습니다.');
    }

    return loan;
  }

  async findOneById(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, isActive: true },
      relations: ['paymentSchedules', 'prepayments', 'analytics'],
    });
    return loan;
  }

  async findOneByIdOrFail(id: string): Promise<Loan> {
    const loan = await this.findOneById(id);
    if (!loan) {
      throw new NotFoundException('대출을 찾을 수 없습니다.');
    }
    return loan;
  }

  /**
   * 대출 정보 수정
   */
  async update(id: string, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

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
  async remove(id: string): Promise<void> {
    const loan = await this.findOneByIdOrFail(id);

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
    options?: FindManyOptions<PaymentSchedule>,
    optionsWhere?: FindOptionsWhere<PaymentSchedule>,
  ): Promise<PaymentSchedule[]> {
    const where: FindOptionsWhere<PaymentSchedule> = {
      loanId,
      ...optionsWhere,
    };
    return this.paymentScheduleRepository.find({
      where,
      ...options,
    });
  }

  /**
   * 상환 스케줄 생성
   */
  async createPaymentSchedule(
    loanId: string,
    createScheduleDto: CreatePaymentScheduleDto,
  ): Promise<PaymentSchedule> {
    await this.findOne(loanId); // 대출 존재 확인

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
  ): Promise<PaymentSchedule> {
    await this.findOne(loanId); // 대출 존재 확인

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
  ): Promise<void> {
    await this.findOne(loanId); // 대출 존재 확인

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
  async getPrepayments(loanId: string): Promise<Prepayment[]> {
    await this.findOne(loanId); // 대출 존재 확인

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
  ): Promise<Prepayment> {
    const loan = await this.findOne(loanId);

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
  async generatePaymentSchedules(loan: Loan): Promise<void> {
    const schedules: Partial<PaymentSchedule>[] = [];
    const totalMonths = loan.term; // 대출 기간
    const monthlyRate = loan.interestRate / 100 / 12; // 월 이자율

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
          // 공식: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
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
          // 공식: M = P / n + (P * r)
          principalAmount = loan.amount / totalMonths;
          remainingBalance = loan.amount - principalAmount * month;
          interestAmount = remainingBalance * monthlyRate;
          totalAmount = principalAmount + interestAmount;
          break;

        case RepaymentType.BULLET_PAYMENT:
          // 만기일시상환: 만기까지 이자만, 원금은 만기에
          // 공식: M = P * r (중간 달), M = P + (P * r) (마지막 달)
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
    loan.isActive = true;
    await this.loanRepository.save(loan);
    // 상환 계획표 일괄 저장
    await this.paymentScheduleRepository.save(schedules);
  }

  /**
   * 원리금균등상환 월 상환금 계산
   * 공식: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
   */
  private calculateEqualInstallment(
    principal: number,
    monthlyRate: number,
    totalMonths: number,
  ): number {
    if (monthlyRate === 0) {
      return principal / totalMonths;
    }
    console.log('principal', principal);
    console.log('monthlyRate', monthlyRate);
    console.log('totalMonths', totalMonths);
    // M = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
    const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;

    return numerator / denominator;
  }

  /**
   * 원리금균등상환에서 특정 시점의 남은 원금 계산
   * 공식: FV = P * (1 + r)^n - PMT * ((1 + r)^n - 1) / r
   */
  private calculateRemainingPrincipal(
    principal: number,
    monthlyRate: number,
    month: number,
    monthlyPayment: number,
  ): number {
    if (month === 0) return principal;
    if (monthlyRate === 0) return principal - monthlyPayment * month;

    // FV = P * (1 + r)^n - PMT * ((1 + r)^n - 1) / r
    const futureValue =
      principal * Math.pow(1 + monthlyRate, month) -
      (monthlyPayment * (Math.pow(1 + monthlyRate, month) - 1)) / monthlyRate;

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
  async calculateRepaymentProgress(loanId: string): Promise<{
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    progressPercentage: number;
    completedPayments: number;
    totalPayments: number;
  }> {
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
  async calculateTotalInterest(loanId: string): Promise<number> {
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
    prepaymentAmount: number,
    prepaymentDate: Date,
  ): Promise<void> {
    const loan = await this.findOne(loanId);

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
          // 공식: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
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
          // 공식: M = P / n + (P * r)
          principalAmount = newBalance / remainingMonths;
          remainingBalance = newBalance - principalAmount * (i + 1);
          interestAmount = remainingBalance * monthlyRate;
          totalAmount = principalAmount + interestAmount;
          break;

        case RepaymentType.BULLET_PAYMENT:
          // 공식: M = P * r (중간 달), M = P + (P * r) (마지막 달)
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

  /**
   * 대출 상환 요약 조회
   */
  async getLoanRepaymentSummary(
    loanId: string,
  ): Promise<LoanRepaymentSummaryDto> {
    const loan = await this.findOne(loanId);
    if (!loan) {
      throw new NotFoundException(`대출을 찾을 수 없습니다: ${loanId}`);
    }

    // 상환 스케줄 조회
    const paymentSchedules = await this.paymentScheduleRepository.find({
      where: { loanId },
      order: { paymentNumber: 'ASC' },
    });

    // 중도상환 조회
    const prepayments = await this.prepaymentRepository.find({
      where: { loanId, status: PrepaymentStatus.APPLIED },
    });

    // 상환 요약 계산
    const summary = this.calculateRepaymentSummary(
      loan,
      paymentSchedules,
      prepayments,
    );

    return summary;
  }

  /**
   * 사용자의 모든 대출 상환 요약 조회
   */
  async getAllLoansRepaymentSummary(
    userId: string,
  ): Promise<LoanRepaymentSummaryDto[]> {
    const loans = await this.findAllByUserId(userId);
    const summaries: LoanRepaymentSummaryDto[] = [];

    for (const loan of loans) {
      try {
        const summary = await this.getLoanRepaymentSummary(loan.id);
        summaries.push(summary);
      } catch (error) {
        this.logger.error(
          `대출 ${loan.id} 상환 요약 계산 실패: ${error.message}`,
        );
      }
    }

    return summaries;
  }

  /**
   * 상환 요약 계산 로직
   */
  private calculateRepaymentSummary(
    loan: Loan,
    paymentSchedules: PaymentSchedule[],
    prepayments: Prepayment[],
  ): LoanRepaymentSummaryDto {
    // 기본 정보
    const totalPayments = paymentSchedules.length;
    const completedPayments = paymentSchedules.filter(
      (s) => s.status === PaymentStatus.PAID,
    ).length;
    const overduePayments = paymentSchedules.filter(
      (s) => s.status === PaymentStatus.OVERDUE,
    ).length;

    // 총 상환금 및 이자 계산
    const totalRepaymentAmount = paymentSchedules.reduce(
      (sum, s) => sum + parseFloat(s.totalAmount.toString()),
      0,
    );
    const totalInterestAmount = paymentSchedules.reduce(
      (sum, s) => sum + parseFloat(s.interestAmount.toString()),
      0,
    );

    // 중도상환 정보
    const totalPrepaymentAmount = prepayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const prepaymentInterestSavings = this.calculatePrepaymentInterestSavings(
      loan,
      paymentSchedules,
      prepayments,
    );

    // 남은 원금 및 이자
    const remainingPrincipal = this.calculateRemainingPrincipalForSummary(
      loan,
      paymentSchedules,
    );
    const remainingInterest = this.calculateRemainingInterestForSummary(
      loan,
      paymentSchedules,
    );

    // 다음 상환일
    const nextPaymentDate = this.getNextPaymentDate(paymentSchedules);

    // 상환 진행률
    const repaymentProgress =
      totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

    // 이자 및 원금 비율
    const interestRatio =
      totalRepaymentAmount > 0
        ? (totalInterestAmount / totalRepaymentAmount) * 100
        : 0;
    const principalRatio = 100 - interestRatio;

    // 월별 상환 요약
    // const monthlySummary = this.createMonthlySummary(paymentSchedules);

    return {
      // 대출 기본 정보
      // loanId: loan.id, // 대출 고유 식별자 (UUID)
      // loanName: loan.name, // 대출명 (사용자가 설정한 이름)
      // principalAmount: loan.amount, // 대출 원금 (초기 대출 금액)
      // interestRate: loan.interestRate, // 연 이자율 (연간 %)
      // term: loan.term, // 대출 기간 (개월 단위)
      // repaymentType: loan.repaymentType, // 상환 방식 (원리금균등, 원금균등, 만기일시)
      // startDate: loan.startDate, // 대출 시작일
      // endDate: loan.endDate, // 대출 만기일 (계산된 날짜)

      // 상환 금액 정보
      totalRepaymentAmount, // 총 상환금 (원금 + 이자 합계)
      totalInterestAmount, // 총 이자 (전체 상환 기간 동안의 이자 합계)
      // 월 평균 상환금 (총 상환금 / 총 개월 수)
      averageMonthlyPayment:
        totalPayments > 0 ? totalRepaymentAmount / totalPayments : 0,

      // 남은 상환 정보
      remainingPrincipal, // 남은 원금 (아직 상환되지 않은 원금)
      remainingInterest, // 남은 이자 (아직 납부되지 않은 이자)
      nextPaymentDate, // 다음 상환 예정일 (다음번 상환해야 할 날짜)

      // 상환 진행률 및 비율
      repaymentProgress: Math.round(repaymentProgress * 100) / 100, // 상환 진행률 (%)
      interestRatio: Math.round(interestRatio * 100) / 100, // 이자 비율 (총 상환금 대비 이자 %)
      principalRatio: Math.round(principalRatio * 100) / 100, // 원금 비율 (총 상환금 대비 원금 %)

      // 상환 건수 통계
      completedPayments, // 완료된 상환 건수 (납부완료 상태)
      totalPayments, // 전체 상환 건수 (총 개월 수)
      overduePayments, // 연체 건수 (연체 상태인 상환 건수)

      // 중도상환 정보
      totalPrepaymentAmount, // 중도상환 총액 (적용된 중도상환 금액 합계)
      prepaymentInterestSavings, // 중도상환 시 절약되는 이자 (원래 이자 - 새로운 이자)

      // 상세 정보
      // monthlySummary, // 월별 상환 요약 배열 (각 월의 상환 계획 및 실제 내역)
      // createdAt: loan.createdAt, // 대출 생성일시
      // updatedAt: loan.updatedAt, // 대출 최종 수정일시
    };
  }

  /**
   * 남은 원금 계산 (상환 요약용)
   */
  private calculateRemainingPrincipalForSummary(
    loan: Loan,
    paymentSchedules: PaymentSchedule[],
  ): number {
    const paidPrincipal = paymentSchedules
      .filter((s) => s.status === PaymentStatus.PAID)
      .reduce((sum, s) => sum + s.principalAmount, 0);

    return Math.max(0, loan.amount - paidPrincipal);
  }

  /**
   * 남은 이자 계산 (상환 요약용)
   */
  private calculateRemainingInterestForSummary(
    loan: Loan,
    paymentSchedules: PaymentSchedule[],
  ): number {
    const paidInterest = paymentSchedules
      .filter((s) => s.status === PaymentStatus.PAID)
      .reduce((sum, s) => sum + s.interestAmount, 0);

    const totalInterest = paymentSchedules.reduce(
      (sum, s) => sum + s.interestAmount,
      0,
    );

    return Math.max(0, totalInterest - paidInterest);
  }

  /**
   * 다음 상환일 조회
   */
  private getNextPaymentDate(paymentSchedules: PaymentSchedule[]): Date | null {
    const nextSchedule = paymentSchedules.find(
      (s) => s.status === PaymentStatus.PENDING,
    );
    return nextSchedule ? nextSchedule.paymentDate : null;
  }

  /**
   * 중도상환 시 절약되는 이자 계산
   */
  private calculatePrepaymentInterestSavings(
    loan: Loan,
    paymentSchedules: PaymentSchedule[],
    prepayments: Prepayment[],
  ): number {
    if (prepayments.length === 0) return 0;

    let totalSavings = 0;
    const monthlyRate = loan.interestRate / 100 / 12;

    for (const prepayment of prepayments) {
      const prepaymentDate = new Date(prepayment.createdAt);
      const remainingSchedules = paymentSchedules.filter(
        (s) =>
          new Date(s.paymentDate) > prepaymentDate &&
          s.status === PaymentStatus.PENDING,
      );

      if (remainingSchedules.length > 0) {
        const remainingBalance = remainingSchedules[0].remainingBalance;
        const newBalance = remainingBalance - prepayment.amount;

        if (newBalance > 0) {
          // 기존 이자와 새로운 이자의 차이 계산
          const originalInterest = remainingSchedules.reduce(
            (sum, s) => sum + s.interestAmount,
            0,
          );
          const newInterest = this.calculateNewInterest(
            newBalance,
            monthlyRate,
            remainingSchedules.length,
          );
          totalSavings += Math.max(0, originalInterest - newInterest);
        }
      }
    }

    return Math.round(totalSavings);
  }

  /**
   * 새로운 잔액으로 계산된 이자
   */
  private calculateNewInterest(
    newBalance: number,
    monthlyRate: number,
    remainingMonths: number,
  ): number {
    let totalInterest = 0;
    let currentBalance = newBalance;

    for (let i = 0; i < remainingMonths; i++) {
      const monthlyInterest = currentBalance * monthlyRate;
      totalInterest += monthlyInterest;

      // 원금 상환 (균등 원금 상환 방식 가정)
      const monthlyPrincipal = newBalance / remainingMonths;
      currentBalance -= monthlyPrincipal;
    }

    return totalInterest;
  }

  /**
   * 월별 상환 요약 생성
   */
  private createMonthlySummary(
    paymentSchedules: PaymentSchedule[],
  ): MonthlyRepaymentSummary[] {
    return paymentSchedules.map((schedule) => ({
      paymentNumber: schedule.paymentNumber,
      paymentDate: schedule.paymentDate,
      principal: schedule.principalAmount,
      interest: schedule.interestAmount,
      totalPayment: schedule.totalAmount,
      remainingPrincipal: schedule.remainingBalance,
      status: schedule.status,
      actualPaymentDate: schedule.paidAt,
      actualPaymentAmount: schedule.actualPaidAmount,
    }));
  }
}
