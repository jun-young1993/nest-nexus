import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
import { NoticeModule } from 'src/notice/notice.module';
import { User } from 'src/user/entities/user.entity';
import { GoalUser } from './entities/goal-user.entity';
import { GoalProgress } from './entities/goal-progress.entity';
import { GoalProgressService } from './goal-progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, NoticeGroup, User, GoalUser, GoalProgress]),
    NoticeModule,
  ],
  controllers: [GoalController],
  providers: [GoalService, GoalProgressService],
  exports: [GoalService],
})
export class GoalModule {}
