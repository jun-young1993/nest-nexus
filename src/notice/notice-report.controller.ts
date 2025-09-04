import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NoticeReportService } from './notice-report.service';
import { CreateNoticeReportDto } from './dto/create-notice-report.dto';
import { NoticeReport } from './entities/notice-report.entity';
import { NoticeReplyReportService } from './notice-reply-report.service';
import { CreateNoticeReplyReportDto } from './dto/create-notice-reply-report.dto';

@ApiTags('Notice Reports')
@Controller('notice-reports')
export class NoticeReportController {
  constructor(
    private readonly noticeReportService: NoticeReportService,
    private readonly noticeReplyReportService: NoticeReplyReportService,
  ) {}

  @Post()
  @ApiOperation({ summary: '공지사항 신고 생성' })
  @ApiResponse({
    status: 201,
    description: '공지사항 신고가 성공적으로 생성됨',
    type: NoticeReport,
  })
  async create(@Body() createNoticeReportDto: CreateNoticeReportDto) {
    const report = await this.noticeReportService.findByNoticeIdOrReporterId(
      createNoticeReportDto.noticeId,
      createNoticeReportDto.reporterId,
    );

    if (report.length > 0) {
      throw new BadRequestException('이미 신고한 공지사항입니다.');
    }

    return this.noticeReportService.create(createNoticeReportDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 공지사항 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 공지사항 신고 목록을 반환',
    type: [NoticeReport],
  })
  findAll() {
    return this.noticeReportService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 공지사항 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 공지사항 신고 정보를 반환',
    type: NoticeReport,
  })
  findOne(@Param('id') id: string) {
    return this.noticeReportService.findOne(id);
  }

  @Get('notice/:noticeId')
  @ApiOperation({ summary: '특정 공지사항의 모든 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 공지사항의 모든 신고 목록을 반환',
    type: [NoticeReport],
  })
  findByNoticeId(@Param('noticeId') noticeId: string) {
    return this.noticeReportService.findByNoticeId(noticeId);
  }

  @Get('notice-reply/:noticeReplyId')
  @ApiOperation({ summary: '특정 공지사항 댓글의 모든 신고 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 공지사항 댓글의 모든 신고 목록을 반환',
    type: [NoticeReport],
  })
  findByNoticeReplyId(@Param('noticeReplyId') noticeReplyId: string) {
    return this.noticeReplyReportService.findByNoticeReplyId(noticeReplyId);
  }

  @Post('notice-reply')
  @ApiOperation({ summary: '공지사항 댓글 신고 생성' })
  @ApiResponse({
    status: 201,
    description: '공지사항 댓글 신고가 성공적으로 생성됨',
    type: NoticeReport,
  })
  createNoticeReplyReport(
    @Body() createNoticeReplyReportDto: CreateNoticeReplyReportDto,
  ) {
    return this.noticeReplyReportService.create(createNoticeReplyReportDto);
  }
}
