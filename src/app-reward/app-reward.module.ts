import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRewardController } from './app-reward.controller';
import { AppRewardService } from './app-reward.service';
import { UserPointBalance } from './entities/user-point-balance.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { RewardConfig } from './entities/reward-config.entity';
import { UserRewardUsage } from './entities/user-reward-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPointBalance,
      PointTransaction,
      RewardConfig,
      UserRewardUsage,
    ]),
  ],
  controllers: [AppRewardController],
  providers: [AppRewardService],
  exports: [AppRewardService],
})
export class AppRewardModule {}
