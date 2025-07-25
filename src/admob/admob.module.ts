import { Module } from '@nestjs/common';
import { AdmobController } from './admob.controller';

@Module({
  controllers: [AdmobController],
})
export class AdmobModule {}
