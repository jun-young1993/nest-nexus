import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ObjectReport } from './entities/s3-object-report.entity';
import { S3Object } from './entities/s3-object.entity';
import { CreateS3ObjectReportDto } from './dto/create-s3-object-report.dto';

@Injectable()
export class S3ObjectReportService {
  constructor(
    @InjectRepository(S3ObjectReport)
    private readonly s3ObjectReportRepository: Repository<S3ObjectReport>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  async create(
    createS3ObjectReportDto: CreateS3ObjectReportDto,
    s3ObjectId: string,
    reporterId: string,
  ): Promise<S3ObjectReport> {
    const s3Object = await this.s3ObjectRepository.findOne({
      where: { id: s3ObjectId },
    });

    if (!s3Object) {
      throw new NotFoundException('S3 객체를 찾을 수 없습니다.');
    }

    const report = this.s3ObjectReportRepository.create({
      type: createS3ObjectReportDto.type,
      content: createS3ObjectReportDto.content,
      reporterId: reporterId,
      s3Object,
    });

    return this.s3ObjectReportRepository.save(report);
  }

  async findAll(): Promise<S3ObjectReport[]> {
    return this.s3ObjectReportRepository.find({
      relations: ['s3Object'],
    });
  }

  async findOne(id: string): Promise<S3ObjectReport> {
    const report = await this.s3ObjectReportRepository.findOne({
      where: { id },
      relations: ['s3Object'],
    });

    if (!report) {
      throw new NotFoundException('신고 내역을 찾을 수 없습니다.');
    }

    return report;
  }

  async findByS3ObjectId(s3ObjectId: string): Promise<S3ObjectReport[]> {
    return this.s3ObjectReportRepository.find({
      where: { s3Object: { id: s3ObjectId } },
      relations: ['s3Object'],
    });
  }

  async findByS3ObjectIdAndReporterId(
    s3ObjectId: string,
    reporterId: string,
  ): Promise<S3ObjectReport[]> {
    return this.s3ObjectReportRepository.find({
      where: { s3Object: { id: s3ObjectId }, reporterId },
    });
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.s3ObjectReportRepository.remove(report);
  }
}
