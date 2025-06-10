import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { Goal } from './entities/goal.entity';
import { NoticeGroupService } from 'src/notice/notice-group.service';
import { goalGroupName } from 'src/notice/constance/notice-group.constance';
import { GoalProgress } from './entities/goal-progress.entity';
import { CreateGoalProgressDto } from './dto/create-goal-progress.dto';
import { GoalProgressService } from './goal-progress.service';
@ApiTags('Goals')
@Controller('goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly noticeGroupService: NoticeGroupService,
    private readonly goalProgressService: GoalProgressService,
  ) {}

  @Post()
  @ApiOperation({ summary: '목표 생성' })
  @ApiResponse({
    status: 201,
    description: '목표가 성공적으로 생성됨',
    type: Goal,
  })
  async create(@Body() createGoalDto: CreateGoalDto): Promise<Goal> {
    const noticeGroup = await this.noticeGroupService.create({
      name: goalGroupName(new Date().toISOString()),
    });

    return this.goalService.create(createGoalDto, noticeGroup);
  }

  @Get()
  @ApiOperation({ summary: '모든 목표 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 목표 목록을 반환',
    type: [Goal],
  })
  async findAll(): Promise<Goal[]> {
    return this.goalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 목표 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 목표 정보를 반환',
    type: Goal,
  })
  async findOne(@Param('id') id: string): Promise<Goal> {
    return this.goalService.findOne(id);
  }

  @Get('notice-group/:noticeGroupId')
  @ApiOperation({ summary: '공지사항 그룹의 목표 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 공지사항 그룹의 목표 정보를 반환',
    type: Goal,
  })
  async findByNoticeGroupId(
    @Param('noticeGroupId') noticeGroupId: string,
  ): Promise<Goal> {
    return this.goalService.findByNoticeGroupId(noticeGroupId);
  }

  @Post(':goalId/users/:goalUserId/progress')
  @ApiOperation({ summary: '목표 진행 생성' })
  @ApiResponse({
    status: 201,
    description: '목표 진행이 성공적으로 생성됨',
    type: GoalProgress,
  })
  async createGoalProgress(
    @Param('goalId') goalId: string,
    @Param('goalUserId') goalUserId: string,
    @Body() createGoalProgressDto: CreateGoalProgressDto,
  ): Promise<Goal> {
    this.goalProgressService.create(goalId, goalUserId, createGoalProgressDto);

    return this.goalService.findOne(goalId);
  }

  @Get(':goalId/users/:goalUserId/progress')
  @ApiOperation({ summary: '목표 진행 조회' })
  @ApiResponse({
    status: 200,
    description: '목표 진행 조회 성공',
    type: [GoalProgress],
  })
  async getGoalProgress(
    @Param('goalId') goalId: string,
    @Param('goalUserId') goalUserId: string,
  ): Promise<GoalProgress[]> {
    return this.goalProgressService.findAll(goalId, goalUserId);
  }
}
