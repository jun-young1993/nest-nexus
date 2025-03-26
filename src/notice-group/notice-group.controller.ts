import { Body, Controller, Post } from '@nestjs/common';
import { CreateNoticeGroupDto } from './dto/create-notice-group.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('notice-group')
@Controller('notice-group')
export class NoticeGroupController {
  @Post()
  @ApiOperation({ summary: 'Create a new notice group' })
  @ApiResponse({
    status: 201,
    description: 'The notice group has been successfully created.',
    type: CreateNoticeGroupDto,
  })
  @ApiBody({ type: CreateNoticeGroupDto })
  async createNoticeGroup(@Body() body: CreateNoticeGroupDto) {
    return body;
  }
}
