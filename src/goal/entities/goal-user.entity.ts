import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Goal } from './goal.entity';
import { User } from 'src/user/entities/user.entity';
import { GoalProgress } from './goal-progress.entity';

@Entity('goal_user')
export class GoalUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  goalId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => Goal, (goal) => goal.goalUsers)
  @JoinColumn({ name: 'goalId' })
  goal: Goal;

  @ManyToOne(() => User, (user) => user.goalUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => GoalProgress, (goalProgress) => goalProgress.goalUser)
  goalProgresses: GoalProgress[];
}
