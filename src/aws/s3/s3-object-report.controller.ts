import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { S3ObjectReportService } from './s3-object-report.service';
import { S3ObjectReplyReportService } from './s3-object-reply-report.service';
import { CreateS3ObjectReportDto } from './dto/create-s3-object-report.dto';
import { CreateS3ObjectReplyReportDto } from './dto/create-s3-object-reply-report.dto';
import { S3ObjectReport } from './entities/s3-object-report.entity';
import { S3ObjectReplyReport } from './entities/s3-object-reply-report.entity';

@ApiTags('S3 Object Reports')
@Controller('s3-object-reports')
export class S3ObjectReportController {
  constructor(
    private readonly s3ObjectReportService: S3ObjectReportService,
    private readonly s3ObjectReplyReportService: S3ObjectReplyReportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'S3 객체 신고 생성' })
  @ApiResponse({
    status: 201,
    description: 'S3 객체 신고가 성공적으로 생성됨',
    type: S3ObjectReport,
  })
  @ApiResponse({
    status: 400,
    description: '이미 신고한 S3 객체입니다.',
  })
  async create(@Body() createS3ObjectReportDto: CreateS3ObjectReportDto) {
    const existingReports =
      await this.s3ObjectReportService.findByS3ObjectIdAndReporterId(
        createS3ObjectReportDto.s3ObjectId,
        createS3ObjectReportDto.reporterId,
      );

    if (existingReports.length > 0) {
      throw new BadRequestException('이미 신고한 S3 객체입니다.');
    }

    return this.s3ObjectReportService.create(createS3ObjectReportDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 S3 객체 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 S3 객체 신고 목록을 반환',
    type: [S3ObjectReport],
  })
  findAll() {
    return this.s3ObjectReportService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 S3 객체 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 S3 객체 신고 정보를 반환',
    type: S3ObjectReport,
  })
  @ApiResponse({
    status: 404,
    description: '신고 내역을 찾을 수 없습니다.',
  })
  findOne(@Param('id') id: string) {
    return this.s3ObjectReportService.findOne(id);
  }

  @Get('s3-object/:s3ObjectId')
  @ApiOperation({ summary: '특정 S3 객체의 모든 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 S3 객체의 모든 신고 목록을 반환',
    type: [S3ObjectReport],
  })
  findByS3ObjectId(@Param('s3ObjectId') s3ObjectId: string) {
    return this.s3ObjectReportService.findByS3ObjectId(s3ObjectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'S3 객체 신고 삭제' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 신고가 성공적으로 삭제됨',
  })
  @ApiResponse({
    status: 404,
    description: '신고 내역을 찾을 수 없습니다.',
  })
  remove(@Param('id') id: string) {
    return this.s3ObjectReportService.remove(id);
  }

  @Post('reply')
  @ApiOperation({ summary: 'S3 객체 댓글 신고 생성' })
  @ApiResponse({
    status: 201,
    description: 'S3 객체 댓글 신고가 성공적으로 생성됨',
    type: S3ObjectReplyReport,
  })
  @ApiResponse({
    status: 400,
    description: '이미 신고한 S3 객체 댓글입니다.',
  })
  async createReplyReport(
    @Body() createS3ObjectReplyReportDto: CreateS3ObjectReplyReportDto,
  ) {
    const existingReports =
      await this.s3ObjectReplyReportService.findByS3ObjectReplyIdAndReporterId(
        createS3ObjectReplyReportDto.s3ObjectReplyId,
        createS3ObjectReplyReportDto.reporterId,
      );

    if (existingReports.length > 0) {
      throw new BadRequestException('이미 신고한 S3 객체 댓글입니다.');
    }

    return this.s3ObjectReplyReportService.create(createS3ObjectReplyReportDto);
  }

  @Get('reply/all')
  @ApiOperation({ summary: '모든 S3 객체 댓글 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 S3 객체 댓글 신고 목록을 반환',
    type: [S3ObjectReplyReport],
  })
  findAllReplyReports() {
    return this.s3ObjectReplyReportService.findAll();
  }

  @Get('reply/:id')
  @ApiOperation({ summary: '특정 S3 객체 댓글 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 S3 객체 댓글 신고 정보를 반환',
    type: S3ObjectReplyReport,
  })
  @ApiResponse({
    status: 404,
    description: '신고 내역을 찾을 수 없습니다.',
  })
  findOneReplyReport(@Param('id') id: string) {
    return this.s3ObjectReplyReportService.findOne(id);
  }

  @Get('s3-object-reply/:s3ObjectReplyId')
  @ApiOperation({ summary: '특정 S3 객체 댓글의 모든 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 S3 객체 댓글의 모든 신고 목록을 반환',
    type: [S3ObjectReplyReport],
  })
  findByS3ObjectReplyId(@Param('s3ObjectReplyId') s3ObjectReplyId: string) {
    return this.s3ObjectReplyReportService.findByS3ObjectReplyId(
      s3ObjectReplyId,
    );
  }

  @Delete('reply/:id')
  @ApiOperation({ summary: 'S3 객체 댓글 신고 삭제' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 댓글 신고가 성공적으로 삭제됨',
  })
  @ApiResponse({
    status: 404,
    description: '신고 내역을 찾을 수 없습니다.',
  })
  removeReplyReport(@Param('id') id: string) {
    return this.s3ObjectReplyReportService.remove(id);
  }
}
