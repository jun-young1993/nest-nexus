import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalProgress } from './entities/goal-progress.entity';
import { CreateGoalProgressDto } from './dto/create-goal-progress.dto';

@Injectable()
export class GoalProgressService {
  constructor(
    @InjectRepository(GoalProgress)
    private readonly goalProgressRepository: Repository<GoalProgress>,
  ) {}

  async create(
    goalId: string,
    goalUserId: string,
    createGoalProgressDto: CreateGoalProgressDto,
  ): Promise<GoalProgress> {
    const goalProgress = this.goalProgressRepository.create({
      ...createGoalProgressDto,
      goalId,
      goalUserId,
    });
    return this.goalProgressRepository.save(goalProgress);
  }

  async findAll(goalId: string, goalUserId: string) {
    return this.goalProgressRepository.find({
      where: { goalId, goalUserId },
    });
  }
}
