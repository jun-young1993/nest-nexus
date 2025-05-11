import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GoalUser } from './goal-user.entity';

@Entity('goal')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToOne(() => NoticeGroup, (noticeGroup) => noticeGroup.goal)
  @JoinColumn({ name: 'noticeGroupId' })
  noticeGroup: NoticeGroup;

  @OneToMany(() => GoalUser, (goalUser) => goalUser.goal)
  goalUsers: GoalUser[];
}
