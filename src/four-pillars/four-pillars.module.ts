import { Module } from '@nestjs/common';
import { FourPillarsService } from './four-pillars.service';
import { FourPillarsController } from './four-pillars.controller';

@Module({
  controllers: [FourPillarsController],
  providers: [FourPillarsService],
})
export class FourPillarsModule {}
