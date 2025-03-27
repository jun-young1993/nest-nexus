import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNoticeDto } from './dto/create-notice.dto';

@ApiTags('Notice')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notice' })
  @ApiResponse({
    status: 201,
    description: 'The notice has been successfully created.',
    type: CreateNoticeDto,
  })
  @ApiBody({ type: CreateNoticeDto })
  async createNotice(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notice by id' })
  @ApiResponse({
    status: 200,
  })
  async findOne(@Param('id') id: string) {
    return this.noticeService.findOne(id);
  }

  @Get('notice-group/:id')
  @ApiOperation({ summary: 'Get a notice by notice group id' })
  @ApiResponse({
    status: 200,
  })
  async findByNoticeGroupId(@Param('id') id: string) {
    return this.noticeService.findByNoticeGroupId(id);
  }
}
