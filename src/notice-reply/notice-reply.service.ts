import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeReply } from './entities/notice-reply.entity';
import { Repository } from 'typeorm';
import { CreateNoticeReplyDto } from './dto/notice-reply.dto';

@Injectable()
export class NoticeReplyService {
  constructor(
    @InjectRepository(NoticeReply)
    private noticeReplyRepository: Repository<NoticeReply>,
  ) {}

  async create(createNoticeReplyDto: CreateNoticeReplyDto) {
    return await this.noticeReplyRepository.save(
      this.noticeReplyRepository.create(createNoticeReplyDto),
    );
  }

  async findAllByNoticeId(noticeId: string) {
    return await this.noticeReplyRepository.find({
      where: { noticeId },
    });
  }
}
