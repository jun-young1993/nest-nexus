import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { Like } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserBlockService } from 'src/user/user-block.service';

@ApiTags('Notice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notice')
export class NoticeController {
  constructor(
    private readonly noticeService: NoticeService,
    private readonly userService: UserService,
    private readonly userBlockService: UserBlockService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notice' })
  @ApiResponse({
    status: 201,
    description: 'The notice has been successfully created.',
    type: CreateNoticeDto,
  })
  @ApiBody({ type: CreateNoticeDto })
  async createNotice(@Body() createNoticeDto: CreateNoticeDto) {
    if (!createNoticeDto.userName) {
      const user = await this.userService.findOneOrFail(createNoticeDto.userId);
      createNoticeDto.userName = user.username;
    }
    return this.noticeService.create(createNoticeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notice by id' })
  @ApiResponse({
    status: 200,
  })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const notice = await this.noticeService.findOne(id);

    await this.noticeService.incrementViewCount(id, userId);
    if (notice) {
      const isBlocked = await this.userBlockService.isUserBlocked(
        userId,
        notice.userId,
      );
      notice.isBlocked = isBlocked;
    }
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
  async findByName(
    @Request() req: any,
    @Param('name') name: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('title') title?: string,
  ) {
    const blockerId = req.user.id;
    const notices = await this.noticeService.findByName(name, {
      skip: skip || 0,
      take: take || 10,
      where: {
        title: title ? Like(`%${title}%`) : undefined,
      },
    });
    for (const notice of notices) {
      const isBlocked = await this.userBlockService.isUserBlocked(
        blockerId,
        notice.userId,
      );
      notice.isBlocked = isBlocked;
    }
    return notices;
  }
}
