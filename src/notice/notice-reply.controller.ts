import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NoticeReplyService } from './notice-reply.service';
import { CreateNoticeReplyDto } from '../notice/dto/create-notice-reply.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NoticeReply } from '../notice/entities/notice-reply.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserBlockService } from 'src/user/user-block.service';

@ApiTags('Notice Reply')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notice-reply')
export class NoticeReplyController {
  constructor(
    private readonly noticeReplyService: NoticeReplyService,
    private readonly userBlockService: UserBlockService,
  ) {}

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
  async findAllByNoticeId(@Request() req: any, @Param('id') noticeId: string) {
    const blockerId = req.user.id;

    const noticeReplies =
      await this.noticeReplyService.findAllByNoticeId(noticeId);
    for (const noticeReply of noticeReplies) {
      const isBlocked = await this.userBlockService.isUserBlocked(
        blockerId,
        noticeReply.userId,
      );
      noticeReply.isBlocked = isBlocked;
    }
    return noticeReplies;
  }
}
