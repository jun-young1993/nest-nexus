import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { S3ObjectReplyReportService } from './s3-object-reply-report.service';
import { CreateS3ObjectReplyReportDto } from './dto/create-s3-object-reply-report.dto';
import { S3ObjectReplyReport } from './entities/s3-object-reply-report.entity';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('S3 Object Reply Reports')
@Controller('s3-object-reply-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class S3ObjectReplyReportController {
  constructor(
    private readonly s3ObjectReplyReportService: S3ObjectReplyReportService,
  ) {}

  @Post('s3-object-reply/:replyId')
  @ApiOperation({ summary: 'S3 객체 댓글 신고 생성' })
  @ApiBearerAuth()
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
    @Param('replyId') replyId: string,
    @CurrentUser() user: User,
  ) {
    const existingReports =
      await this.s3ObjectReplyReportService.findByS3ObjectReplyIdAndReporterId(
        replyId,
        user.id,
      );

    if (existingReports.length > 0) {
      throw new BadRequestException('이미 신고한 S3 객체 댓글입니다.');
    }

    return this.s3ObjectReplyReportService.create(
      createS3ObjectReplyReportDto,
      replyId,
      user.id,
    );
  }
}
