import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LoanService } from './loan.service';
import { Loan, LoanStatus, RepaymentType } from './entities/loan.entity';
import {
  PaymentSchedule,
  PaymentStatus,
} from './entities/payment-schedule.entity';
import { Prepayment, PrepaymentStatus } from './entities/prepayment.entity';
import { LoanAnalytics } from './entities/loan-analytics.entity';

describe('LoanService', () => {
  let service: LoanService;
  let loanRepository: Repository<Loan>;
  let paymentScheduleRepository: Repository<PaymentSchedule>;
  let prepaymentRepository: Repository<Prepayment>;
  let loanAnalyticsRepository: Repository<LoanAnalytics>;
  let dataSource: DataSource;

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
});
