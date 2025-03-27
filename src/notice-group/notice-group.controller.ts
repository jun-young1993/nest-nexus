import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateNoticeGroupDto } from './dto/create-notice-group.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoticeGroupService } from './notice-group.service';

@ApiTags('notice-group')
@Controller('notice-group')
export class NoticeGroupController {
  constructor(private readonly noticeGroupService: NoticeGroupService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new notice group' })
  @ApiResponse({
    status: 201,
    description: 'The notice group has been successfully created.',
    type: CreateNoticeGroupDto,
  })
  @ApiBody({ type: CreateNoticeGroupDto })
  async createNoticeGroup(@Body() body: CreateNoticeGroupDto) {
    return this.noticeGroupService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notice group by id' })
  @ApiResponse({
    status: 200,
    description: 'The notice group has been successfully retrieved.',
  })
  async getNoticeGroup(@Param('id') id: string) {
    return this.noticeGroupService.findOne(id);
  }
}
