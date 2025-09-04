import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeReplyReport } from './entities/notice-reply-report.entity';
import { CreateNoticeReplyReportDto } from './dto/create-notice-reply-report.dto';
import { NoticeReply } from './entities/notice-reply.entity';

@Injectable()
export class NoticeReplyReportService {
  constructor(
    @InjectRepository(NoticeReplyReport)
    private readonly noticeReplyReportRepository: Repository<NoticeReplyReport>,
    @InjectRepository(NoticeReply)
    private readonly noticeReplyRepository: Repository<NoticeReply>,
  ) {}

  async create(
    createNoticeReportDto: CreateNoticeReplyReportDto,
  ): Promise<NoticeReplyReport> {
    const noticeReply = await this.noticeReplyRepository.findOne({
      where: { id: createNoticeReportDto.noticeReplyId },
    });

    if (!noticeReply) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    const report = this.noticeReplyReportRepository.create({
      type: createNoticeReportDto.type,
      content: createNoticeReportDto.content,
      reporterId: createNoticeReportDto.reporterId,
      noticeReply,
    });

    return this.noticeReplyReportRepository.save(report);
  }

  async findAll(): Promise<NoticeReplyReport[]> {
    return this.noticeReplyReportRepository.find({
      relations: ['notice'],
    });
  }

  async findByNoticeReplyId(
    noticeReplyId: string,
  ): Promise<NoticeReplyReport[]> {
    return this.noticeReplyReportRepository.find({
      where: { noticeReply: { id: noticeReplyId } },
      relations: ['notice'],
    });
  }

  async findByNoticeIdOrReporterId(
    noticeReplyId: string,
    reporterId: string,
  ): Promise<NoticeReplyReport[]> {
    return this.noticeReplyReportRepository.find({
      where: { noticeReply: { id: noticeReplyId }, reporterId },
    });
  }
  async findOne(id: string): Promise<NoticeReplyReport> {
    const report = await this.noticeReplyReportRepository.findOne({
      where: { id },
      relations: ['noticeReply'],
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    return report;
  }
}
