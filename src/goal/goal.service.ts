import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { NoticeGroup } from 'src/notice/entities/notice-group.entity';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(NoticeGroup)
    private readonly noticeGroupRepository: Repository<NoticeGroup>,
  ) {}

  async create(
    createGoalDto: CreateGoalDto,
    noticeGroup: NoticeGroup,
  ): Promise<Goal> {
    this.logger.log(`Creating goal with title: ${createGoalDto.title}`);

    const goal = this.goalRepository.create({
      title: createGoalDto.title,
      description: createGoalDto.description,
      startDate: createGoalDto.startDate,
      endDate: createGoalDto.endDate,
      noticeGroup,
    });

    try {
      const savedGoal = await this.goalRepository.save(goal);
      this.logger.log(`Goal created successfully with id: ${savedGoal.id}`);
      return savedGoal;
    } catch (error) {
      this.logger.error(`Failed to create goal: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Goal[]> {
    this.logger.log('Finding all goals');
    try {
      const goals = await this.goalRepository.find({
        relations: ['noticeGroup', 'noticeGroup.notices'],
      });
      this.logger.log(`Found ${goals.length} goals`);
      return goals;
    } catch (error) {
      this.logger.error(`Failed to find goals: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Goal> {
    this.logger.log(`Finding goal with id: ${id}`);
    try {
      const goal = await this.goalRepository.findOne({
        where: { id },
        relations: ['noticeGroup'],
      });

      if (!goal) {
        this.logger.warn(`Goal not found with id: ${id}`);
        throw new NotFoundException('목표를 찾을 수 없습니다.');
      }

      this.logger.log(`Found goal with id: ${id}`);
      return goal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find goal: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByNoticeGroupId(noticeGroupId: string): Promise<Goal> {
    this.logger.log(`Finding goal for notice group: ${noticeGroupId}`);
    try {
      const goal = await this.goalRepository.findOne({
        where: { noticeGroup: { id: noticeGroupId } },
        relations: ['noticeGroup'],
      });

      if (!goal) {
        this.logger.warn(`Goal not found for notice group: ${noticeGroupId}`);
        throw new NotFoundException(
          '해당 공지사항 그룹의 목표를 찾을 수 없습니다.',
        );
      }

      this.logger.log(`Found goal for notice group: ${noticeGroupId}`);
      return goal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find goal for notice group: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
