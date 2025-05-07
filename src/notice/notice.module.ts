import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';
import { NoticeGroup } from './entities/notice-group.entity';
import { NoticeGroupController } from './notice-group.controller';
import { NoticeGroupService } from './notice-group.service';
import { NoticeReply } from './entities/notice-reply.entity';
import { NoticeReplyService } from './notice-reply.service';
import { NoticeReplyController } from './notice-reply.controller';
import { NoticeReport } from './entities/notice-report.entity';
import { NoticeReportService } from './notice-report.service';
import { NoticeReportController } from './notice-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice, NoticeGroup, NoticeReply, NoticeReport]),
  ],
  controllers: [
    NoticeController,
    NoticeGroupController,
    NoticeReplyController,
    NoticeReportController,
  ],
  providers: [
    NoticeService,
    NoticeGroupService,
    NoticeReplyService,
    NoticeReportService,
  ],
  exports: [
    NoticeService,
    NoticeGroupService,
    NoticeReplyService,
    NoticeReportService,
  ],
})
export class NoticeModule {}
