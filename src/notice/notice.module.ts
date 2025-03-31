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

@Module({
  imports: [TypeOrmModule.forFeature([Notice, NoticeGroup, NoticeReply])],
  controllers: [NoticeController, NoticeGroupController, NoticeReplyController],
  providers: [NoticeService, NoticeGroupService, NoticeReplyService],
  exports: [NoticeService, NoticeGroupService, NoticeReplyService],
})
export class NoticeModule {}
