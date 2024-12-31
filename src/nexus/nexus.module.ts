import { Module } from '@nestjs/common';
import { NexusService } from './nexus.service';
import { NexusController } from './nexus.controller';

@Module({
  providers: [NexusService],
  controllers: [NexusController],
})
export class NexusModule {}
