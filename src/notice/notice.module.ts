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
import { UserModule } from 'src/user/user.module';
import { NoticeView } from './entities/notice-view.entity';
import { NoticeViewService } from './notice-view.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Notice,
      NoticeGroup,
      NoticeReply,
      NoticeReport,
      NoticeView,
    ]),
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
    NoticeViewService,
  ],
  exports: [
    NoticeService,
    NoticeGroupService,
    NoticeReplyService,
    NoticeReportService,
    NoticeViewService,
  ],
})
export class NoticeModule {}
