import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';
import { NoticeGroupModule } from '../notice-group/notice-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notice]), NoticeGroupModule],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
