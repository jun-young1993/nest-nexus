import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LoanService } from './loan.service';
import { Loan, RepaymentType } from './entities/loan.entity';
import {
  PaymentSchedule,
  PaymentStatus,
} from './entities/payment-schedule.entity';
import { Prepayment } from './entities/prepayment.entity';
import { LoanAnalytics } from './entities/loan-analytics.entity';

describe('LoanService', () => {
  let service: LoanService;

  const mockLoanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockPaymentScheduleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockPrepaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockLoanAnalyticsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        {
          provide: getRepositoryToken(Loan),
          useValue: mockLoanRepository,
        },
        {
          provide: getRepositoryToken(PaymentSchedule),
          useValue: mockPaymentScheduleRepository,
        },
        {
          provide: getRepositoryToken(Prepayment),
          useValue: mockPrepaymentRepository,
        },
        {
          provide: getRepositoryToken(LoanAnalytics),
          useValue: mockLoanAnalyticsRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
    loanRepository = module.get<Repository<Loan>>(getRepositoryToken(Loan));
    paymentScheduleRepository = module.get<Repository<PaymentSchedule>>(
      getRepositoryToken(PaymentSchedule),
    );
    prepaymentRepository = module.get<Repository<Prepayment>>(
      getRepositoryToken(Prepayment),
    );
    loanAnalyticsRepository = module.get<Repository<LoanAnalytics>>(
      getRepositoryToken(LoanAnalytics),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePaymentSchedules', () => {
    it('should generate payment schedules for equal installment loan', async () => {
      // Arrange
      const loanId = 'test-loan-id';
             const mockLoan: Partial<Loan> = {
         id: loanId,
         amount: 10000000, // 1000만원
         term: 12, // 12개월
         interestRate: 5, // 연 5% (퍼센트 단위)
         startDate: new Date('2024-01-01'),
         paymentDay: 15,
         repaymentType: RepaymentType.EQUAL_INSTALLMENT,
         isActive: false,
       };

      // Mock loan repository to return the loan
      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      // Mock payment schedule repository
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      // Act
      // generatePaymentSchedules는 private 메서드이므로 create 메서드를 통해 간접적으로 테스트
      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 5, // 연 5% (퍼센트 단위)
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      // Act
      await service.create(createLoanDto, 'test-user-id');

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should generate payment schedules for equal principal loan', async () => {
      // Arrange
      const loanId = 'test-loan-id';
      const mockLoan: Partial<Loan> = {
        id: loanId,
        amount: 10000000, // 1000만원
        term: 12, // 12개월
        interestRate: 0.05 / 12, // 연 5% -> 월 0.417%
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.EQUAL_PRINCIPAL,
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.EQUAL_PRINCIPAL,
      };

      // Act
      await service.create(createLoanDto, 'test-user-id');

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should generate payment schedules for bullet payment loan', async () => {
      // Arrange
      const loanId = 'test-loan-id';
      const mockLoan: Partial<Loan> = {
        id: loanId,
        amount: 10000000, // 1000만원
        term: 12, // 12개월
        interestRate: 0.05 / 12, // 연 5% -> 월 0.417%
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.BULLET_PAYMENT,
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.BULLET_PAYMENT,
      };

      // Act
      await service.create(createLoanDto, 'test-user-id');

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should handle loan with custom payment day', async () => {
      // Arrange
      const loanId = 'test-loan-id';
      const mockLoan: Partial<Loan> = {
        id: loanId,
        amount: 10000000,
        term: 6,
        interestRate: 0.06 / 12, // 연 6% -> 월 0.5%
        startDate: new Date('2024-01-01'),
        paymentDay: 25, // 25일
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 6,
        interestRate: 0.06 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 25,
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
      };

      // Act
      await service.create(createLoanDto, 'test-user-id');

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should handle loan starting from end of month', async () => {
      // Arrange
      const loanId = 'test-loan-id';
      const mockLoan: Partial<Loan> = {
        id: loanId,
        amount: 5000000, // 500만원
        term: 3,
        interestRate: 0.04 / 12, // 연 4% -> 월 0.333%
        startDate: new Date('2024-01-31'), // 1월 31일
        paymentDay: 31, // 31일
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 5000000,
        term: 3,
        interestRate: 0.04 / 12,
        startDate: new Date('2024-01-31'),
        paymentDay: 31,
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
      };

      // Act
      await service.create(createLoanDto, 'test-user-id');

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should throw error for unsupported repayment type', async () => {
      // Arrange
      const loanId = 'test-loan-id';
      const mockLoan: Partial<Loan> = {
        id: loanId,
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: 'UNSUPPORTED' as RepaymentType, // 지원하지 않는 상환 방식
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: 'UNSUPPORTED' as RepaymentType,
      };

      // Act & Assert
      await expect(
        service.create(createLoanDto, 'test-user-id'),
      ).rejects.toThrow('Unsupported repayment type: UNSUPPORTED');
    });
  });

  describe('create method integration', () => {
    it('should create loan and generate payment schedules successfully', async () => {
      // Arrange
      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
      };

      const userId = 'test-user-id';
      const mockLoan: Partial<Loan> = {
        id: 'generated-loan-id',
        ...createLoanDto,
        userId,
        endDate: new Date('2025-01-01'),
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);
      mockPaymentScheduleRepository.save.mockResolvedValue([]);

      // Act
      const result = await service.create(createLoanDto, userId);

      // Assert
      expect(result).toEqual(mockLoan);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const createLoanDto = {
        name: 'Test Loan',
        userId: 'test-user-id',
        amount: 10000000,
        term: 12,
        interestRate: 0.05 / 12,
        startDate: new Date('2024-01-01'),
        paymentDay: 15,
        repaymentType: RepaymentType.EQUAL_INSTALLMENT,
      };

      const userId = 'test-user-id';
      const mockLoan: Partial<Loan> = {
        id: 'generated-loan-id',
        ...createLoanDto,
        userId,
        endDate: new Date('2025-01-01'),
        isActive: false,
      };

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createLoanDto, userId)).rejects.toThrow(
        'Database error',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('createPaymentSchedule', () => {
    const mockLoanId = 'test-loan-id';
    const mockLoan = { id: mockLoanId, amount: 10000000 };

    beforeEach(() => {
      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
    });

    it('should create payment schedule with PENDING status for future dates', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30일 후

      const createScheduleDto = {
        paymentNumber: 1,
        paymentDate: futureDate,
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
      };

      const expectedSchedule = {
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PENDING,
      };

      mockPaymentScheduleRepository.create.mockReturnValue(expectedSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue(expectedSchedule);

      // Act
      const result = await service.createPaymentSchedule(
        mockLoanId,
        createScheduleDto,
      );

      // Assert
      expect(mockPaymentScheduleRepository.create).toHaveBeenCalledWith({
        ...createScheduleDto,
        loanId: mockLoanId,
      });
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalledWith(
        expectedSchedule,
      );
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paidAt).toBeUndefined();
    });

    it('should create payment schedule with PAID status for past dates', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30일 전

      const createScheduleDto = {
        paymentNumber: 1,
        paymentDate: pastDate,
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
      };

      const expectedSchedule = {
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        actualPaidAmount: 350000,
      };

      mockPaymentScheduleRepository.create.mockReturnValue(expectedSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue(expectedSchedule);

      // Act
      const result = await service.createPaymentSchedule(
        mockLoanId,
        createScheduleDto,
      );

      // Assert
      expect(mockPaymentScheduleRepository.create).toHaveBeenCalledWith({
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        actualPaidAmount: 350000,
      });
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalledWith(
        expectedSchedule,
      );
      expect(result.status).toBe(PaymentStatus.PAID);
      expect(result.paidAt).toBeDefined();
      expect(result.actualPaidAmount).toBe(350000);
    });

    it('should create payment schedule with PAID status for past dates using custom actualPaidAmount', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15); // 15일 전

      const createScheduleDto = {
        paymentNumber: 1,
        paymentDate: pastDate,
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
        actualPaidAmount: 300000, // 사용자가 지정한 실제 납부 금액
      };

      const expectedSchedule = {
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        actualPaidAmount: 300000,
      };

      mockPaymentScheduleRepository.create.mockReturnValue(expectedSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue(expectedSchedule);

      // Act
      const result = await service.createPaymentSchedule(
        mockLoanId,
        createScheduleDto,
      );

      // Assert
      expect(mockPaymentScheduleRepository.create).toHaveBeenCalledWith({
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        actualPaidAmount: 300000,
      });
      expect(result.actualPaidAmount).toBe(300000);
    });

    it('should create payment schedule with PENDING status for today', async () => {
      // Arrange
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 00:00:00

      const createScheduleDto = {
        paymentNumber: 1,
        paymentDate: today,
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
      };

      const expectedSchedule = {
        ...createScheduleDto,
        loanId: mockLoanId,
        status: PaymentStatus.PENDING,
      };

      mockPaymentScheduleRepository.create.mockReturnValue(expectedSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue(expectedSchedule);

      // Act
      const result = await service.createPaymentSchedule(
        mockLoanId,
        createScheduleDto,
      );

      // Assert
      expect(mockPaymentScheduleRepository.create).toHaveBeenCalledWith({
        ...createScheduleDto,
        loanId: mockLoanId,
      });
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paidAt).toBeUndefined();
    });

    it('should throw NotFoundException when loan does not exist', async () => {
      // Arrange
      mockLoanRepository.findOne.mockResolvedValue(null);

      const createScheduleDto = {
        paymentNumber: 1,
        paymentDate: new Date(),
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
      };

      // Act & Assert
      await expect(
        service.createPaymentSchedule(
          'non-existent-loan-id',
          createScheduleDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should get payment schedule by id', async () => {
      // Arrange
      const mockSchedule = {
        id: 'schedule-id',
        loanId: mockLoanId,
        paymentNumber: 1,
        paymentDate: new Date(),
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
        status: PaymentStatus.PENDING,
      };

      mockPaymentScheduleRepository.findOne.mockResolvedValue(mockSchedule);

      // Act
      const result = await service.getPaymentSchedule(mockLoanId, 'schedule-id');

      // Assert
      expect(mockPaymentScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'schedule-id', loanId: mockLoanId },
      });
      expect(result).toEqual(mockSchedule);
    });

    it('should throw NotFoundException when payment schedule does not exist', async () => {
      // Arrange
      mockPaymentScheduleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getPaymentSchedule(mockLoanId, 'non-existent-schedule-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should update payment schedule', async () => {
      // Arrange
      const existingSchedule = {
        id: 'schedule-id',
        loanId: mockLoanId,
        paymentNumber: 1,
        paymentDate: new Date(),
        principalAmount: 200000,
        interestAmount: 150000,
        totalAmount: 350000,
        remainingBalance: 48000000,
        status: PaymentStatus.PENDING,
      };

      const updateData = {
        status: PaymentStatus.PAID,
        actualPaidAmount: 350000,
        notes: '정상 납부 완료',
      };

      const updatedSchedule = { ...existingSchedule, ...updateData };

      mockPaymentScheduleRepository.findOne.mockResolvedValue(existingSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue(updatedSchedule);

      // Act
      const result = await service.updatePaymentSchedule(
        mockLoanId,
        'schedule-id',
        updateData,
      );

      // Assert
      expect(mockPaymentScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'schedule-id', loanId: mockLoanId },
      });
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateData),
      );
      expect(result).toEqual(updatedSchedule);
    });

    it('should update payment schedule status with paidAt', async () => {
      // Arrange
      const existingSchedule = {
        id: 'schedule-id',
        loanId: mockLoanId,
        status: PaymentStatus.PENDING,
        paidAt: null,
      };

      const statusUpdate = {
        status: PaymentStatus.PAID,
        actualPaidAmount: 350000,
        notes: '정상 납부 완료',
      };

      mockPaymentScheduleRepository.findOne.mockResolvedValue(existingSchedule);
      mockPaymentScheduleRepository.save.mockResolvedValue({
        ...existingSchedule,
        ...statusUpdate,
        paidAt: expect.any(Date),
      });

      // Act
      const result = await service.updatePaymentScheduleStatus(
        mockLoanId,
        'schedule-id',
        statusUpdate,
      );

      // Assert
      expect(mockPaymentScheduleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.PAID,
          paidAt: expect.any(Date),
          actualPaidAmount: 350000,
          notes: '정상 납부 완료',
        }),
      );
    });

    it('should get payment schedule stats', async () => {
      // Arrange
      const mockSchedules = [
        {
          id: '1',
          status: PaymentStatus.PAID,
          actualPaidAmount: 350000,
          totalAmount: 350000,
        },
        {
          id: '2',
          status: PaymentStatus.PAID,
          actualPaidAmount: 350000,
          totalAmount: 350000,
        },
        {
          id: '3',
          status: PaymentStatus.PENDING,
          actualPaidAmount: 0,
          totalAmount: 350000,
        },
        {
          id: '4',
          status: PaymentStatus.OVERDUE,
          actualPaidAmount: 0,
          totalAmount: 350000,
        },
      ];

      mockPaymentScheduleRepository.find.mockResolvedValue(mockSchedules);

      // Act
      const result = await service.getPaymentScheduleStats(mockLoanId);

      // Assert
      expect(result).toEqual({
        totalSchedules: 4,
        paidSchedules: 2,
        pendingSchedules: 1,
        overdueSchedules: 1,
        totalPaidAmount: 700000,
        totalRemainingAmount: 700000,
      });
    });

    it('should remove payment schedule', async () => {
      // Arrange
      const mockSchedule = {
        id: 'schedule-id',
        loanId: mockLoanId,
      };

      mockPaymentScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockPaymentScheduleRepository.remove.mockResolvedValue(mockSchedule);

      // Act
      await service.removePaymentSchedule(mockLoanId, 'schedule-id');

      // Assert
      expect(mockPaymentScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'schedule-id', loanId: mockLoanId },
      });
      expect(mockPaymentScheduleRepository.remove).toHaveBeenCalledWith(mockSchedule);
    });

    it('should throw NotFoundException when removing non-existent payment schedule', async () => {
      // Arrange
      mockPaymentScheduleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.removePaymentSchedule(mockLoanId, 'non-existent-schedule-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
