import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ObjectReplyReport } from './entities/s3-object-reply-report.entity';
import { S3ObjectReply } from './entities/s3-object-reply.entity';
import { CreateS3ObjectReplyReportDto } from './dto/create-s3-object-reply-report.dto';

@Injectable()
export class S3ObjectReplyReportService {
  constructor(
    @InjectRepository(S3ObjectReplyReport)
    private readonly s3ObjectReplyReportRepository: Repository<S3ObjectReplyReport>,
    @InjectRepository(S3ObjectReply)
    private readonly s3ObjectReplyRepository: Repository<S3ObjectReply>,
  ) {}

  async create(
    createS3ObjectReplyReportDto: CreateS3ObjectReplyReportDto,
  ): Promise<S3ObjectReplyReport> {
    const s3ObjectReply = await this.s3ObjectReplyRepository.findOne({
      where: { id: createS3ObjectReplyReportDto.s3ObjectReplyId },
    });

    if (!s3ObjectReply) {
      throw new NotFoundException('S3 객체 댓글을 찾을 수 없습니다.');
    }

    const report = this.s3ObjectReplyReportRepository.create({
      type: createS3ObjectReplyReportDto.type,
      content: createS3ObjectReplyReportDto.content,
      reporterId: createS3ObjectReplyReportDto.reporterId,
      s3ObjectReply,
    });

    return this.s3ObjectReplyReportRepository.save(report);
  }

  async findAll(): Promise<S3ObjectReplyReport[]> {
    return this.s3ObjectReplyReportRepository.find({
      relations: ['s3ObjectReply'],
    });
  }

  async findOne(id: string): Promise<S3ObjectReplyReport> {
    const report = await this.s3ObjectReplyReportRepository.findOne({
      where: { id },
      relations: ['s3ObjectReply'],
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    return report;
  }

  async findByS3ObjectReplyId(
    s3ObjectReplyId: string,
  ): Promise<S3ObjectReplyReport[]> {
    return this.s3ObjectReplyReportRepository.find({
      where: { s3ObjectReply: { id: s3ObjectReplyId } },
      relations: ['s3ObjectReply'],
    });
  }

  async findByS3ObjectReplyIdAndReporterId(
    s3ObjectReplyId: string,
    reporterId: string,
  ): Promise<S3ObjectReplyReport[]> {
    return this.s3ObjectReplyReportRepository.find({
      where: { s3ObjectReply: { id: s3ObjectReplyId }, reporterId },
    });
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.s3ObjectReplyReportRepository.remove(report);
  }
}
