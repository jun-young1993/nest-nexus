import { Module } from '@nestjs/common';
import { AdmobController } from './admob.controller';
import { AppRewardModule } from '../app-reward/app-reward.module';

@Module({
  imports: [AppRewardModule],
  controllers: [AdmobController],
})
export class AdmobModule {}
