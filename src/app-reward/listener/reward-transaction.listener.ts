import { createNestLogger } from 'src/factories/logger.factory';
import { AppRewardService } from '../app-reward.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { RewardTransactionEvent } from '../events/reward-transaction.event';
import { UserStorageLimitService } from 'src/user/user-storage-limit.service';
import { UserService } from 'src/user/user.service';
import { PointTransaction } from '../entities/point-transaction.entity';
import { RewardName } from '../entities/reward-config.entity';
import { UserGroupService } from 'src/user/user-group.service';
import { StorageLimitType } from 'src/user/entities/user-storage-limit.entity';

@Injectable()
export class RewardTransactionListener {
  private readonly logger = createNestLogger(RewardTransactionListener.name);
  constructor(
    private readonly appRewardService: AppRewardService,
    private readonly userStorageLimitService: UserStorageLimitService,
    private readonly userService: UserService,
    private readonly userGroupService: UserGroupService,
  ) {}

  @OnEvent(EventName.REWARD_TRANSACTION)
  async handleRewardTransaction(event: RewardTransactionEvent) {
    const { pointTransaction, rewardConfig } = event;

    try {
      this.logger.info(
        `Reward transaction started: ${pointTransaction.id} [REWARD CONFIG] ${rewardConfig.name}`,
      );
      if (
        rewardConfig.name === RewardName.BABY_LOG_GROUP_LEADER_STORAGE_INCREASE
      ) {
        await this.increaseBabyLogGroupLeaderStorage(pointTransaction);
      }
    } catch (error) {
      this.logger.error(
        `Reward transaction failed: ${error.message}`,
        error.stack,
      );
    }
  }

  async increaseBabyLogGroupLeaderStorage(pointTransaction: PointTransaction) {
    const { userId } = pointTransaction;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const groupAdminUser =
      await this.userGroupService.findGroupAdminByUser(user);
    if (!groupAdminUser) {
      throw new NotFoundException('Group admin user not found');
    }

    await this.userStorageLimitService.increaseLimitValue(
      [groupAdminUser],
      StorageLimitType.S3_STORAGE,
      pointTransaction.amount * 1024 * 1024 * 100,
    );
  }
}
