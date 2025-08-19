import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { CreatePrepaymentDto } from './dto/create-prepayment.dto';
import { Loan } from './entities/loan.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { Prepayment } from './entities/prepayment.entity';
import { FindOptionsOrderValue } from 'typeorm';

@ApiTags('loans')
@Controller('loans')
export class LoanController {
  private readonly logger = new Logger(LoanController.name);

  constructor(private readonly loanService: LoanService) {}

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

  // 상환 스케줄 관련 엔드포인트
  @Get(':id/schedule')
  @ApiOperation({ summary: '대출의 상환 스케줄 조회' })
  @ApiParam({ name: 'id', description: '대출 ID' })
  @ApiParam({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiParam({ name: 'take', description: '조회할 개수', required: false })
  @ApiParam({ name: 'order', description: '정렬 방식', required: false })
  @ApiResponse({
    status: 200,
    description: '상환 스케줄이 성공적으로 조회되었습니다.',
    type: [PaymentSchedule],
  })
  async getPaymentSchedules(
    @Param('id') id: string,
    @Param('skip') skip: number = 0,
    @Param('take') take: number = 15,
    @Param('order') order: FindOptionsOrderValue = 'ASC',
  ): Promise<PaymentSchedule[]> {
    return this.loanService.getPaymentSchedules(id, {
      skip,
      take,
      order: { paymentNumber: order },
    });
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
}
