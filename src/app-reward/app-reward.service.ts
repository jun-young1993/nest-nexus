import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserPointBalance } from './entities/user-point-balance.entity';
import {
  PointTransaction,
  TransactionType,
  TransactionSource,
} from './entities/point-transaction.entity';
import {
  RewardConfig,
  RewardName,
  RewardType,
} from './entities/reward-config.entity';
import { UserRewardUsage } from './entities/user-reward-usage.entity';
import { PointWithdrawal, WithdrawalStatus } from './entities/point-withdrawal.entity';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';
import { ProcessRewardDto } from './dto/process-reward.dto';

@Injectable()
export class AppRewardService {
  private readonly logger = new Logger(AppRewardService.name);

  constructor(
    @InjectRepository(UserPointBalance)
    private readonly userPointBalanceRepository: Repository<UserPointBalance>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(RewardConfig)
    private readonly rewardConfigRepository: Repository<RewardConfig>,
    @InjectRepository(UserRewardUsage)
    private readonly userRewardUsageRepository: Repository<UserRewardUsage>,
    @InjectRepository(PointWithdrawal)
    private readonly pointWithdrawalRepository: Repository<PointWithdrawal>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 사용자의 포인트 잔액 조회
   */
  async getUserPointBalance(userId: string): Promise<UserPointBalance> {
    let balance = await this.userPointBalanceRepository.findOne({
      where: { userId },
    });

    if (!balance) {
      // 잔액이 없으면 새로 생성
      balance = this.userPointBalanceRepository.create({
        userId,
        currentPoints: 0,
        totalEarnedPoints: 0,
        totalSpentPoints: 0,
        totalWithdrawnPoints: 0,
      });
      await this.userPointBalanceRepository.save(balance);
    }

    return balance;
  }

  /**
   * 포인트 거래 처리 (트랜잭션)
   */
  async processPointTransaction(
    createDto: CreatePointTransactionDto,
  ): Promise<PointTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 현재 잔액 조회
      let balance = await this.userPointBalanceRepository.findOne({
        where: { userId: createDto.userId },
      });

      if (!balance) {
        balance = this.userPointBalanceRepository.create({
          userId: createDto.userId,
          currentPoints: 0,
          totalEarnedPoints: 0,
          totalSpentPoints: 0,
          totalWithdrawnPoints: 0,
        });
      }

      const balanceBefore = balance.currentPoints;
      const balanceAfter = balanceBefore + createDto.amount;

      // 잔액이 부족한 경우 체크
      if (balanceAfter < 0) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      // 거래 내역 생성
      const transaction = this.pointTransactionRepository.create({
        ...createDto,
        balanceBefore,
        balanceAfter,
      });

      await this.pointTransactionRepository.save(transaction);

      // 잔액 업데이트
      balance.currentPoints = balanceAfter;

      if (createDto.amount > 0) {
        balance.totalEarnedPoints += createDto.amount;
      } else {
        if (createDto.transactionType === TransactionType.WITHDRAW) {
          balance.totalWithdrawnPoints += Math.abs(createDto.amount);
        } else {
          balance.totalSpentPoints += Math.abs(createDto.amount);
        }
      }

      await this.userPointBalanceRepository.save(balance);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`포인트 거래 처리 실패: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRewardConfig(
    TransactionSource: TransactionSource,
    RewardName: RewardName,
  ) {
    const rewardConfig = await this.rewardConfigRepository.findOne({
      where: {
        name: RewardName,
        rewardType: this.mapSourceToRewardType(TransactionSource),
        isActive: true,
      },
    });

    if (!rewardConfig) {
      throw new NotFoundException('리워드 설정을 찾을 수 없습니다.');
    }

    return rewardConfig;
  }

  /**
   * 리워드 처리 (광고 시청 등)
   */
  async processReward(processDto: ProcessRewardDto): Promise<PointTransaction> {
    // 리워드 설정 조회
    const rewardConfig = await this.getRewardConfig(
      processDto.source,
      processDto.rewardName,
    );

    if (!rewardConfig) {
      throw new NotFoundException('리워드 설정을 찾을 수 없습니다.');
    }

    // 일일 제한 체크
    if (rewardConfig.dailyLimit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsage = await this.userRewardUsageRepository.findOne({
        where: {
          userId: processDto.userId,
          rewardType: rewardConfig.rewardType,
          date: today,
        },
      });

      if (todayUsage && todayUsage.usageCount >= rewardConfig.dailyLimit) {
        throw new BadRequestException('일일 리워드 제한에 도달했습니다.');
      }
    }

    // 쿨다운 체크
    if (rewardConfig.cooldownMinutes > 0) {
      const lastTransaction = await this.pointTransactionRepository.findOne({
        where: {
          userId: processDto.userId,
          source: processDto.source,
        },
        order: { createdAt: 'DESC' },
      });

      if (lastTransaction) {
        const cooldownTime = new Date(
          lastTransaction.createdAt.getTime() +
            rewardConfig.cooldownMinutes * 60000,
        );
        if (new Date() < cooldownTime) {
          throw new BadRequestException('쿨다운 시간이 남아있습니다.');
        }
      }
    }

    return await this.processPoint(
      processDto,
      rewardConfig,
      TransactionType.EARN,
    );
  }

  public async processPoint(
    processDto: ProcessRewardDto,
    rewardConfig: RewardConfig,
    transactionType: TransactionType,
  ) {
    // 포인트 거래 처리
    const transaction = await this.processPointTransaction({
      userId: processDto.userId,
      transactionType: transactionType,
      source: processDto.source,
      amount: rewardConfig.pointsPerReward,
      description: rewardConfig.description,
      referenceId: processDto.referenceId,
      metadata: processDto.metadata,
    });

    // 사용 내역 업데이트
    await this.updateUserRewardUsage(
      processDto.userId,
      rewardConfig.rewardType,
      rewardConfig.pointsPerReward,
    );

    return transaction;
  }

  /**
   * 사용자 리워드 사용 내역 업데이트
   */
  private async updateUserRewardUsage(
    userId: string,
    rewardType: RewardType,
    pointsEarned: number,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await this.userRewardUsageRepository.findOne({
      where: {
        userId,
        rewardType,
        date: today,
      },
    });

    if (!usage) {
      usage = this.userRewardUsageRepository.create({
        userId,
        rewardType,
        date: today,
        usageCount: 0,
        totalPointsEarned: 0,
      });
    }

    usage.usageCount += 1;
    usage.totalPointsEarned += pointsEarned;

    await this.userRewardUsageRepository.save(usage);
  }

  /**
   * 소스를 리워드 타입으로 매핑
   */
  private mapSourceToRewardType(source: TransactionSource): RewardType {
    const mapping = {
      [TransactionSource.ADMOB_REWARD]: RewardType.ADMOB_REWARD,
      [TransactionSource.OFFERWALL]: RewardType.OFFERWALL,
      [TransactionSource.DAILY_BONUS]: RewardType.DAILY_BONUS,
      [TransactionSource.REFERRAL]: RewardType.REFERRAL,
      [TransactionSource.PURCHASE]: RewardType.PURCHASE,
    };

    return mapping[source] || RewardType.ADMOB_REWARD;
  }

  /**
   * 사용자의 거래 내역 조회
   */
  async getUserTransactions(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<PointTransaction[]> {
    return this.pointTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * 사용자의 일일 리워드 사용 현황 조회
   */
  async getUserDailyUsage(
    userId: string,
    date?: Date,
    rewardType?: RewardType,
  ): Promise<UserRewardUsage[]> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.userRewardUsageRepository.find({
      where: {
        userId,
        date: targetDate,
        ...(rewardType && { rewardType }),
      },
    });
  }

  /**
   * 포인트 출금 완료 처리
   * 1. 출금 요청 상태를 완료로 변경
   * 2. 사용자 포인트 잔액에서 출금액 차감
   * 3. 포인트 거래 내역 생성
   */
  async completeWithdrawal(withdrawalId: string): Promise<PointWithdrawal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 출금 요청 조회
      const withdrawal = await this.pointWithdrawalRepository.findOne({
        where: { id: withdrawalId },
      });

      if (!withdrawal) {
        throw new NotFoundException('출금 요청을 찾을 수 없습니다.');
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        throw new BadRequestException('이미 처리된 출금 요청입니다.');
      }

      // 사용자 포인트 잔액 조회
      const balance = await this.userPointBalanceRepository.findOne({
        where: { userId: withdrawal.userId },
      });

      if (!balance) {
        throw new NotFoundException('사용자 포인트 잔액을 찾을 수 없습니다.');
      }

      if (balance.currentPoints < withdrawal.withdrawalAmount) {
        throw new BadRequestException('포인트 잔액이 부족합니다.');
      }

      // 1. 출금 요청 상태를 완료로 변경
      // withdrawal.status = WithdrawalStatus.COMPLETED;
      withdrawal.completedAmount = withdrawal.withdrawalAmount;
      await this.pointWithdrawalRepository.save(withdrawal);

      // 2. 사용자 포인트 잔액에서 출금액 차감
      balance.currentPoints -= withdrawal.withdrawalAmount;
      balance.totalWithdrawnPoints += withdrawal.withdrawalAmount;
      await this.userPointBalanceRepository.save(balance);

      // 3. 포인트 거래 내역 생성 (출금)
      const transaction = this.pointTransactionRepository.create({
        userId: withdrawal.userId,
        transactionType: TransactionType.WITHDRAW,
        source: TransactionSource.WITHDRAWAL,
        amount: -withdrawal.withdrawalAmount, // 음수로 출금 표시
        description: `포인트 출금 요청 대기: ${withdrawal.bankName} ${withdrawal.accountNumber}`,
        referenceId: withdrawal.id,
        balanceBefore: balance.currentPoints + withdrawal.withdrawalAmount,
        balanceAfter: balance.currentPoints,
        metadata: JSON.stringify({
          withdrawalId: withdrawal.id,
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          accountHolder: withdrawal.accountHolder,
        }),
      });
      await this.pointTransactionRepository.save(transaction);

      await queryRunner.commitTransaction();
      this.logger.log(`포인트 출금 완료: ${withdrawalId}, 금액: ${withdrawal.withdrawalAmount}`);

      return withdrawal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`포인트 출금 완료 실패: ${withdrawalId}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
