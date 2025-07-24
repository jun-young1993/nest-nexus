import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeReply } from '../notice/entities/notice-reply.entity';
import { Repository } from 'typeorm';
import { CreateNoticeReplyDto } from '../notice/dto/create-notice-reply.dto';

@Injectable()
export class NoticeReplyService {
  constructor(
    @InjectRepository(NoticeReply)
    private noticeReplyRepository: Repository<NoticeReply>,
  ) {}

  async create(noticeId: string, createNoticeReplyDto: CreateNoticeReplyDto) {
    return await this.noticeReplyRepository.save(
      this.noticeReplyRepository.create({
        noticeId,
        ...createNoticeReplyDto,
      }),
    );
  }

  async findAllByNoticeId(noticeId: string) {
    return await this.noticeReplyRepository.find({
      where: { noticeId },
    });
  }
}
