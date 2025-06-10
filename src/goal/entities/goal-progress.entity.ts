import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { GoalUser } from './goal-user.entity';

@Entity('goal_progress')
@Unique(['goalId', 'goalUserId'])
export class GoalProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  goalId: string;

  @Column({ nullable: false })
  goalUserId: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => GoalUser, (goalUser) => goalUser.goalProgresses)
  @JoinColumn([
    { name: 'goalId', referencedColumnName: 'goalId' },
    { name: 'goalUserId', referencedColumnName: 'id' },
  ])
  goalUser: GoalUser;
}
