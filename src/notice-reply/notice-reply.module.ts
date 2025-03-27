import { Module } from '@nestjs/common';
import { NoticeReplyService } from './notice-reply.service';
import { NoticeReplyController } from './notice-reply.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeReply } from './entities/notice-reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeReply])],
  controllers: [NoticeReplyController],
  providers: [NoticeReplyService],
})
export class NoticeReplyModule {}
