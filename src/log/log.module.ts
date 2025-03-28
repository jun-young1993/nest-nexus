import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { Log } from './entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
