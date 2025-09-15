import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { PaymentScheduleSchedulerService } from './payment-schedule-scheduler.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { CreatePrepaymentDto } from './dto/create-prepayment.dto';
import { PaymentStatusInfo } from './dto/payment-status.dto';
import { Loan } from './entities/loan.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { Prepayment } from './entities/prepayment.entity';
import { PaymentStatus } from './entities/payment-schedule.entity';
import { FindOptionsOrderValue } from 'typeorm';
import { LoanRepaymentSummaryDto } from './dto/loan-repayment-summary.dto';

@ApiTags('loans')
@Controller('loans')
export class LoanController {
  private readonly logger = new Logger(LoanController.name);

  constructor(
    private readonly loanService: LoanService,
    private readonly paymentScheduleSchedulerService: PaymentScheduleSchedulerService,
  ) {}

  @Get('test')
  async test() {
    const loanId = 'e014a203-47e6-4f0f-b2d0-d459a108ce57';
    const loan = await this.loanService.findOne(loanId);
    this.loanService.generatePaymentSchedules(loan);
    return loan;
  }

  @Post()
  @ApiOperation({ summary: '새 대출 생성' })
  @ApiResponse({
    status: 201,
    description: '대출이 성공적으로 생성되었습니다.',
    type: Loan,
  })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiBody({ type: CreateLoanDto })
  async create(@Body() createLoanDto: CreateLoanDto): Promise<Loan> {
    const userId = createLoanDto.userId;
    this.logger.log(`대출 생성 요청: 사용자 ${userId}`);
    return this.loanService.create(createLoanDto, userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자의 대출 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '대출 목록이 성공적으로 조회되었습니다.',
    type: [Loan],
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findAll(@Param('userId') userId: string): Promise<Loan[]> {
    this.logger.log(`대출 목록 조회: 사용자 ${userId}`);
    return this.loanService.findAllByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '대출 상세 조회' })
  @ApiParam({ name: 'id', description: '조회할 대출의 ID' })
  @ApiResponse({
    status: 200,
    description: '대출 정보가 성공적으로 조회되었습니다.',
    type: Loan,
  })
  @ApiResponse({ status: 404, description: '대출을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findOne(@Param('id') id: string): Promise<Loan> {
    return this.loanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '대출 정보 수정' })
  @ApiParam({ name: 'id', description: '수정할 대출의 ID' })
  @ApiResponse({
    status: 200,
    description: '대출 정보가 성공적으로 수정되었습니다.',
    type: Loan,
  })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터입니다.' })
  @ApiResponse({ status: 404, description: '대출을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiBody({ type: UpdateLoanDto })
  async update(
    @Param('id') id: string,
    @Body() updateLoanDto: UpdateLoanDto,
  ): Promise<Loan> {
    return this.loanService.update(id, updateLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '대출 삭제' })
  @ApiParam({ name: 'id', description: '삭제할 대출의 ID' })
  @ApiResponse({
    status: 200,
    description: '대출이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '대출을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.loanService.remove(id);
  }

  // 상환 상태 조회 엔드포인트
  @Get('payment/status')
  @ApiOperation({ summary: '상환 상태 enum 항목 조회' })
  @ApiResponse({
    status: 200,
    description: '상환 상태 enum 항목들이 성공적으로 조회되었습니다.',
    type: [PaymentStatusInfo],
  })
  async getPaymentStatuses(): Promise<PaymentStatusInfo[]> {
    // PaymentStatus enum의 모든 값을 자동으로 매핑
    const statusMapping = new Map<
      PaymentStatus,
      { value: string; description: string }
    >([
      [
        PaymentStatus.PENDING,
        { value: '대기', description: '아직 상환 예정인 상태' },
      ],
      [
        PaymentStatus.PAID,
        { value: '납부완료', description: '정상적으로 상환이 완료된 상태' },
      ],
      [
        PaymentStatus.PARTIAL,
        { value: '부분납부', description: '일부만 상환된 상태' },
      ],
      [
        PaymentStatus.OVERDUE,
        { value: '연체', description: '상환 기한을 넘어서 지연된 상태' },
      ],
      [
        PaymentStatus.CANCELLED,
        { value: '취소', description: '상환이 취소된 상태' },
      ],
    ]);

    // enum의 모든 값을 루프로 돌려서 자동 생성
    const statuses: PaymentStatusInfo[] = Object.values(PaymentStatus).map(
      (status) => ({
        key: status,
        value: statusMapping.get(status)?.value || status,
        description: statusMapping.get(status)?.description || `${status} 상태`,
      }),
    );

    return statuses;
  }

  // 상환 스케줄 관련 엔드포인트
  @Get(':id/schedule')
  @ApiOperation({ summary: '대출의 상환 스케줄 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiQuery({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiQuery({ name: 'take', description: '조회할 개수', required: false })
  @ApiQuery({ name: 'order', description: '정렬 방식', required: false })
  @ApiQuery({ name: 'status', description: '상태', required: false })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄이 성공적으로 조회되었습니다.',
    type: [PaymentSchedule],
  })
  async getPaymentSchedules(
    @Param('id') id: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 15,
    @Query('order') order: FindOptionsOrderValue = 'ASC',
    @Query('status') status: PaymentSchedule['status'],
  ): Promise<PaymentSchedule[]> {
    return this.loanService.getPaymentSchedules(
      id,
      {
        skip,
        take,
        order: { paymentNumber: order },
      },
      { status: status === null ? undefined : status },
    );
  }

  @Get(':id/schedule/stats')
  @ApiOperation({ summary: '대출의 상환 스케줄 통계 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄 통계가 성공적으로 조회되었습니다.',
  })
  async getPaymentScheduleStats(@Param('id') id: string): Promise<{
    totalSchedules: number;
    paidSchedules: number;
    pendingSchedules: number;
    overdueSchedules: number;
    totalPaidAmount: number;
    totalRemainingAmount: number;
  }> {
    return this.loanService.getPaymentScheduleStats(id);
  }

  @Get(':id/schedule/:scheduleId')
  @ApiOperation({ summary: '특정 상환 스케줄 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiParam({ name: 'scheduleId', description: '상환 스케줄 ID' })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄이 성공적으로 조회되었습니다.',
    type: PaymentSchedule,
  })
  async getPaymentSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ): Promise<PaymentSchedule> {
    return this.loanService.getPaymentSchedule(id, scheduleId);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: '상환 스케줄 생성' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiResponse({
    status: 201,
    description: '상환 스케줄이 성공적으로 생성되었습니다.',
    type: PaymentSchedule,
  })
  @ApiBody({ type: CreatePaymentScheduleDto })
  async createPaymentSchedule(
    @Param('id') id: string,
    @Body() createScheduleDto: CreatePaymentScheduleDto,
  ): Promise<PaymentSchedule> {
    return this.loanService.createPaymentSchedule(id, createScheduleDto);
  }

  @Patch(':id/schedule/:scheduleId')
  @ApiOperation({ summary: '상환 스케줄 수정' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiParam({ name: 'scheduleId', description: '상환 스케줄 ID' })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄이 성공적으로 수정되었습니다.',
    type: PaymentSchedule,
  })
  async updatePaymentSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @Body() updateData: Partial<CreatePaymentScheduleDto>,
  ): Promise<PaymentSchedule> {
    return this.loanService.updatePaymentSchedule(id, scheduleId, updateData);
  }

  @Patch(':id/schedule/:scheduleId/status')
  @ApiOperation({ summary: '상환 스케줄 상태 업데이트' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiParam({ name: 'scheduleId', description: '상환 스케줄 ID' })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄 상태가 성공적으로 업데이트되었습니다.',
    type: PaymentSchedule,
  })
  async updatePaymentScheduleStatus(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @Body()
    statusUpdate: {
      status: PaymentStatus;
      actualPaidAmount?: number;
      notes?: string;
    },
  ): Promise<PaymentSchedule> {
    return this.loanService.updatePaymentScheduleStatus(
      id,
      scheduleId,
      statusUpdate,
    );
  }

  @Delete(':id/schedule/:scheduleId')
  @ApiOperation({ summary: '상환 스케줄 삭제' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiParam({ name: 'scheduleId', description: '상환 스케줄 ID' })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄이 성공적으로 삭제되었습니다.',
  })
  async removePaymentSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ): Promise<void> {
    return this.loanService.removePaymentSchedule(id, scheduleId);
  }

  // 중도상환 관련 엔드포인트
  @Get(':id/prepayments')
  @ApiOperation({ summary: '대출의 중도상환 목록 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiResponse({
    status: 200,
    description: '중도상환 목록이 성공적으로 조회되었습니다.',
    type: [Prepayment],
  })
  async getPrepayments(@Param('id') id: string): Promise<Prepayment[]> {
    return this.loanService.getPrepayments(id);
  }

  @Post(':id/prepayments')
  @ApiOperation({ summary: '중도상환 생성' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiResponse({
    status: 201,
    description: '중도상환이 성공적으로 생성되었습니다.',
    type: Prepayment,
  })
  @ApiBody({ type: CreatePrepaymentDto })
  async createPrepayment(
    @Param('id') id: string,
    @Body() createPrepaymentDto: CreatePrepaymentDto,
  ): Promise<Prepayment> {
    return this.loanService.createPrepayment(id, createPrepaymentDto);
  }

  @Post('prepayments/:prepaymentId/apply')
  @ApiOperation({ summary: '중도상환 적용' })
  @ApiParam({ name: 'prepaymentId', description: '중도상환 ID' })
  @ApiResponse({
    status: 200,
    description: '중도상환이 성공적으로 적용되었습니다.',
    type: Prepayment,
  })
  async applyPrepayment(
    @Param('prepaymentId') prepaymentId: string,
    @Param('userId') userId: string,
  ): Promise<Prepayment> {
    return this.loanService.applyPrepayment(prepaymentId, userId);
  }

  // 대출 상환 요약 관련 엔드포인트
  @Get(':id/summary')
  @ApiOperation({ summary: '대출 상환 요약 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiResponse({
    status: 200,
    description: '대출 상환 요약이 성공적으로 조회되었습니다.',
    type: LoanRepaymentSummaryDto,
  })
  @ApiResponse({ status: 404, description: '대출을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getLoanRepaymentSummary(
    @Param('id') id: string,
  ): Promise<LoanRepaymentSummaryDto> {
    this.logger.log(`대출 상환 요약 조회: 대출 ${id}`);
    return this.loanService.getLoanRepaymentSummary(id);
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: '사용자의 모든 대출 상환 요약 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '모든 대출 상환 요약이 성공적으로 조회되었습니다.',
    type: [LoanRepaymentSummaryDto],
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getAllLoansRepaymentSummary(
    @Param('userId') userId: string,
  ): Promise<LoanRepaymentSummaryDto[]> {
    this.logger.log(`사용자 대출 상환 요약 조회: 사용자 ${userId}`);
    return this.loanService.getAllLoansRepaymentSummary(userId);
  }

  @Get('scheduler/test-upcoming')
  @ApiOperation({ summary: '내일 상환 예정 스케줄 수동 조회 (테스트용)' })
  @ApiResponse({
    status: 200,
    description: '내일 상환 예정 스케줄 조회가 완료되었습니다.',
  })
  async testUpcomingSchedules(): Promise<{ message: string }> {
    this.logger.log('내일 상환 예정 스케줄 수동 조회 시작');
    await this.paymentScheduleSchedulerService.getUpcomingSchedulesManually();
    return {
      message:
        '내일 상환 예정 스케줄 조회가 완료되었습니다. 로그를 확인하세요.',
    };
  }
}
