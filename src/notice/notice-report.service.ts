import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeReport } from './entities/notice-report.entity';
import { Notice } from './entities/notice.entity';
import { CreateNoticeReportDto } from './dto/create-notice-report.dto';

@Injectable()
export class NoticeReportService {
  constructor(
    @InjectRepository(NoticeReport)
    private readonly noticeReportRepository: Repository<NoticeReport>,
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  async create(
    createNoticeReportDto: CreateNoticeReportDto,
  ): Promise<NoticeReport> {
    const notice = await this.noticeRepository.findOne({
      where: { id: createNoticeReportDto.noticeId },
    });

    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    const report = this.noticeReportRepository.create({
      type: createNoticeReportDto.type,
      content: createNoticeReportDto.content,
      reporterId: createNoticeReportDto.reporterId,
      notice,
    });

    return this.noticeReportRepository.save(report);
  }

  async findAll(): Promise<NoticeReport[]> {
    return this.noticeReportRepository.find({
      relations: ['notice'],
    });
  }

  async findByNoticeId(noticeId: string): Promise<NoticeReport[]> {
    return this.noticeReportRepository.find({
      where: { notice: { id: noticeId } },
      relations: ['notice'],
    });
  }

  async findByNoticeIdOrReporterId(
    noticeId: string,
    reporterId: string,
  ): Promise<NoticeReport[]> {
    return this.noticeReportRepository.find({
      where: { notice: { id: noticeId }, reporterId },
    });
  }
  async findOne(id: string): Promise<NoticeReport> {
    const report = await this.noticeReportRepository.findOne({
      where: { id },
      relations: ['notice'],
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    return report;
  }
}
