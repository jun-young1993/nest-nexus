import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { Log } from './entities/log.entity';
import { LogGroupService } from 'src/log/log-group.service';
import { LogGroup } from 'src/log/entities/log-group.entity';
import { LogGroupController } from 'src/log/log-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Log, LogGroup])],
  controllers: [LogController, LogGroupController],
  providers: [LogService, LogGroupService],
  exports: [LogService, LogGroupService],
})
export class LogModule {}
