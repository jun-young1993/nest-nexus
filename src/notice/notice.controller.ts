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
  ApiParam,
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

  @Get('notice-group/name/:name/year/:year/month/:month/existence')
  @ApiOperation({ summary: 'Get a notice by notice group name and date' })
  @ApiParam({
    name: 'name',
    description: '조회 공지사항 그룹 이름',
    example: 'notice',
  })
  @ApiParam({ name: 'year', description: '조회 년도 (YYYY)', example: '2025' })
  @ApiParam({ name: 'month', description: '조회 월 (MM)', example: '09' })
  @ApiOperation({ summary: '해당 월의 날짜별 S3 객체 존재 여부 체크' })
  @ApiResponse({
    status: 200,
    description: '해당 월의 날짜별 객체 존재 여부 조회 성공',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'boolean',
      },
      example: {
        '2025-09-01': true,
        '2025-09-02': false,
        '2025-09-03': true,
        '2025-09-04': false,
        '2025-09-05': true,
        // ... 해당 월의 모든 날짜
        '2025-09-30': false,
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 년도/월 형식' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({
    status: 200,
  })
  async findByNameAndDate(
    @Param('name') name: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    // 년도/월 형식 검증
    const yearRegex = /^\d{4}$/;
    const monthRegex = /^(0[1-9]|1[0-2])$/;

    month = month.length === 1 ? '0' + month : month;

    if (!yearRegex.test(year)) {
      throw new Error('잘못된 년도 형식입니다. YYYY 형식을 사용해주세요.');
    }

    if (!monthRegex.test(month)) {
      throw new Error('잘못된 월 형식입니다. MM 형식(01-12)을 사용해주세요.');
    }
    return this.noticeService.checkExistenceByMonth(name, year, month);
  }

  @Get('notice-group/name/:name/year/:year/month/:month/day/:day')
  @ApiOperation({ summary: 'Get a notice by notice group name and date' })
  @ApiResponse({
    status: 200,
  })
  async getNoticeByDate(
    @Param('name') name: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
  ) {
    return this.noticeService.getNoticeByDate(name, year, month, day);
  }
}
