import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
    const notice = await this.noticeService.findOne(id);
    await this.noticeService.incrementViewCount(id);
    return notice;
  }

  @Get('notice-group/:id')
  @ApiOperation({ summary: 'Get a notice by notice group id' })
  @ApiResponse({
    status: 200,
  })
  async findByNoticeGroupId(@Param('id') id: string) {
    return this.noticeService.findByNoticeGroupId(id);
  }

  @Get('notice-group/name/:name')
  @ApiOperation({ summary: 'Get a notice by notice group name' })
  @ApiResponse({
    status: 200,
  })
  async findOneByName(
    @Param('name') name: string,
    @Query('take') take?: number,
    @Query('created_at_order') createdAtOrder?: 'ASC' | 'DESC',
  ) {
    return this.noticeService.findOneByName(name, {
      take: take || 10,
      order: {
        createdAt: createdAtOrder || 'DESC',
      },
    });
  }
}
