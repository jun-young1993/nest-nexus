import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogGroup } from './log-group.entity';
import { LogGroupController } from './log-group.controller';
import { LogGroupService } from './log-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogGroup])],
  controllers: [LogGroupController],
  providers: [LogGroupService],
  exports: [LogGroupService],
})
export class LogGroupModule {}
