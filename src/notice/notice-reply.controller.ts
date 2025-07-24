import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NoticeReplyService } from './notice-reply.service';
import { CreateNoticeReplyDto } from '../notice/dto/create-notice-reply.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoticeReply } from '../notice/entities/notice-reply.entity';

@ApiTags('Notice Reply')
@Controller('notice-reply')
export class NoticeReplyController {
  constructor(private readonly noticeReplyService: NoticeReplyService) {}

  @Post('notice')
  @ApiOperation({ summary: 'Create a new notice reply' })
  @ApiResponse({
    status: 201,
    description: 'The notice reply has been successfully created.',
    type: CreateNoticeReplyDto,
  })
  create(@Body() createNoticeReplyDto: CreateNoticeReplyDto) {
    return this.noticeReplyService.create(createNoticeReplyDto);
  }

  @Get('notice/:id')
  @ApiOperation({ summary: 'Get all notice replies by notice id' })
  @ApiResponse({
    status: 200,
    description: 'The notice replies have been successfully retrieved.',
    type: [NoticeReply],
  })
  findAllByNoticeId(@Param('id') noticeId: string) {
    return this.noticeReplyService.findAllByNoticeId(noticeId);
  }
}
