import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentScheduleSchedulerService } from './payment-schedule-scheduler.service';
import {
  PaymentSchedule,
  PaymentStatus,
} from './entities/payment-schedule.entity';
import { Loan } from './entities/loan.entity';

describe('PaymentScheduleSchedulerService', () => {
  let service: PaymentScheduleSchedulerService;
  let paymentScheduleRepository: Repository<PaymentSchedule>;

  const mockPaymentScheduleRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentScheduleSchedulerService,
        {
          provide: getRepositoryToken(PaymentSchedule),
          useValue: mockPaymentScheduleRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentScheduleSchedulerService>(
      PaymentScheduleSchedulerService,
    );
    paymentScheduleRepository = module.get<Repository<PaymentSchedule>>(
      getRepositoryToken(PaymentSchedule),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUpcomingSchedulesManually', () => {
    it('should return upcoming payment schedules for tomorrow', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const mockSchedules: PaymentSchedule[] = [
        {
          id: 'schedule-1',
          loanId: 'loan-1',
          paymentNumber: 1,
          paymentDate: tomorrow,
          principalAmount: 200000,
          interestAmount: 150000,
          totalAmount: 350000,
          remainingBalance: 48000000,
          status: PaymentStatus.PENDING,
          actualPaidAmount: 0,
          lateFee: 0,
          notes: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          loan: {
            id: 'loan-1',
            name: 'Test Loan',
            userId: 'user-1',
          } as Loan,
        },
        {
          id: 'schedule-2',
          loanId: 'loan-2',
          paymentNumber: 2,
          paymentDate: tomorrow,
          principalAmount: 200000,
          interestAmount: 150000,
          totalAmount: 350000,
          remainingBalance: 46000000,
          status: PaymentStatus.PENDING,
          actualPaidAmount: 0,
          lateFee: 0,
          notes: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          loan: {
            id: 'loan-2',
            name: 'Test Loan 2',
            userId: 'user-2',
          } as Loan,
        },
      ];

      mockPaymentScheduleRepository.find.mockResolvedValue(mockSchedules);

      // Act
      const result = await service.getUpcomingSchedulesManually();

      // Assert
      expect(mockPaymentScheduleRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: PaymentStatus.PENDING,
        }),
        relations: ['loan'],
        order: {
          paymentDate: 'ASC',
          paymentNumber: 'ASC',
        },
      });
      expect(result).toEqual(mockSchedules);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no upcoming schedules', async () => {
      // Arrange
      mockPaymentScheduleRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getUpcomingSchedulesManually();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should only return PENDING status schedules', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const mockSchedules: PaymentSchedule[] = [
        {
          id: 'schedule-1',
          loanId: 'loan-1',
          paymentNumber: 1,
          paymentDate: tomorrow,
          principalAmount: 200000,
          interestAmount: 150000,
          totalAmount: 350000,
          remainingBalance: 48000000,
          status: PaymentStatus.PENDING,
          actualPaidAmount: 0,
          lateFee: 0,
          notes: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          loan: {
            id: 'loan-1',
            name: 'Test Loan',
            userId: 'user-1',
          } as Loan,
        },
      ];

      mockPaymentScheduleRepository.find.mockResolvedValue(mockSchedules);

      // Act
      const result = await service.getUpcomingSchedulesManually();

      // Assert
      expect(mockPaymentScheduleRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: PaymentStatus.PENDING,
        }),
        relations: ['loan'],
        order: {
          paymentDate: 'ASC',
          paymentNumber: 'ASC',
        },
      });
      expect(
        result.every((schedule) => schedule.status === PaymentStatus.PENDING),
      ).toBe(true);
    });
  });

  describe('checkUpcomingPaymentSchedules', () => {
    it('should log when no upcoming schedules found', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      mockPaymentScheduleRepository.find.mockResolvedValue([]);

      // Act
      await service.checkUpcomingPaymentSchedules();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('Payment Schedule 알림 체크 시작');
      expect(loggerSpy).toHaveBeenCalledWith(
        '내일 상환 예정인 스케줄이 없습니다.',
      );
      expect(loggerSpy).toHaveBeenCalledWith('Payment Schedule 알림 체크 완료');
    });

    it('should log upcoming schedules when found', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const mockSchedules: PaymentSchedule[] = [
        {
          id: 'schedule-1',
          loanId: 'loan-1',
          paymentNumber: 1,
          paymentDate: tomorrow,
          principalAmount: 200000,
          interestAmount: 150000,
          totalAmount: 350000,
          remainingBalance: 48000000,
          status: PaymentStatus.PENDING,
          actualPaidAmount: 0,
          lateFee: 0,
          notes: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          loan: {
            id: 'loan-1',
            name: 'Test Loan',
            userId: 'user-1',
          } as Loan,
        },
      ];

      const loggerSpy = jest.spyOn(service['logger'], 'log');
      mockPaymentScheduleRepository.find.mockResolvedValue(mockSchedules);

      // Act
      await service.checkUpcomingPaymentSchedules();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('Payment Schedule 알림 체크 시작');
      expect(loggerSpy).toHaveBeenCalledWith(
        '내일 상환 예정인 스케줄 1건 발견',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('상환 예정 알림 - 대출 ID: loan-1'),
      );
      expect(loggerSpy).toHaveBeenCalledWith('Payment Schedule 알림 체크 완료');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Database connection failed');
      mockPaymentScheduleRepository.find.mockRejectedValue(error);

      // Act
      await service.checkUpcomingPaymentSchedules();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Payment Schedule 알림 체크 중 오류 발생:',
        error,
      );
    });
  });
});
