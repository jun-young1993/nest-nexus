import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
import { User } from 'src/user/entities/user.entity';
import { GoalUser } from './entities/goal-user.entity';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(NoticeGroup)
    private readonly noticeGroupRepository: Repository<NoticeGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GoalUser)
    private readonly goalUserRepository: Repository<GoalUser>,
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

    const savedGoal = await this.goalRepository.save(goal);
    this.logger.log(`Goal created successfully with id: ${savedGoal.id}`);
    await this.addUserToGoal(savedGoal.id, createGoalDto.userId, true);
    return savedGoal;
  }

  async findAll(): Promise<Goal[]> {
    this.logger.log('Finding all goals');
    const goals = await this.goalRepository.find({
      relations: [
        'noticeGroup',
        'noticeGroup.notices',
        'goalUsers',
        'goalUsers.user',
        'goalUsers.goalProgresses',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
    this.logger.log(`Found ${goals.length} goals`);
    return goals;
  }

  async findOne(id: string): Promise<Goal> {
    this.logger.log(`Finding goal with id: ${id}`);
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
  }

  async findByNoticeGroupId(noticeGroupId: string): Promise<Goal> {
    this.logger.log(`Finding goal for notice group: ${noticeGroupId}`);
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
  }

  async addUserToGoal(
    goalId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<GoalUser> {
    this.logger.log(`Adding user ${userId} to goal ${goalId}`);

    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
    });

    if (!goal) {
      this.logger.warn(`Goal not found with id: ${goalId}`);
      throw new NotFoundException('목표를 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User not found with id: ${userId}`);
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const existingGoalUser = await this.goalUserRepository.findOne({
      where: {
        goal: { id: goalId },
        user: { id: userId },
      },
    });

    if (existingGoalUser) {
      this.logger.log(`User ${userId} is already in goal ${goalId}`);
      return existingGoalUser;
    }

    const goalUser = this.goalUserRepository.create({
      goal,
      user,
      isAdmin,
    });

    const savedGoalUser = await this.goalUserRepository.save(goalUser);
    this.logger.log(`User ${userId} added to goal ${goalId}`);
    return savedGoalUser;
  }

  async removeUserFromGoal(goalId: string, userId: string): Promise<void> {
    this.logger.log(`Removing user ${userId} from goal ${goalId}`);

    const goalUser = await this.goalUserRepository.findOne({
      where: {
        goal: { id: goalId },
        user: { id: userId },
      },
    });

    if (!goalUser) {
      this.logger.warn(`User ${userId} is not associated with goal ${goalId}`);
      return;
    }

    await this.goalUserRepository.remove(goalUser);
    this.logger.log(`User ${userId} removed from goal ${goalId}`);
  }

  async getGoalUsers(goalId: string): Promise<User[]> {
    this.logger.log(`Getting users for goal ${goalId}`);
    const goalUsers = await this.goalUserRepository.find({
      where: { goal: { id: goalId } },
      relations: ['user'],
    });

    return goalUsers.map((goalUser) => goalUser.user);
  }
}
