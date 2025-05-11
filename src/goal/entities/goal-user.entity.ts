import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Goal } from './goal.entity';
import { User } from 'src/user/entities/user.entity';

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
}
