import { PointTransaction } from '../entities/point-transaction.entity';
import { RewardConfig } from '../entities/reward-config.entity';

export class RewardTransactionEvent {
  constructor(
    public readonly pointTransaction: PointTransaction,
    public readonly rewardConfig: RewardConfig,
  ) {}
}
