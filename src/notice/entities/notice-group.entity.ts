import { Goal } from 'src/goal/entities/goal.entity';
import { Notice } from 'src/notice/entities/notice.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class NoticeGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Notice, (notice) => notice.noticeGroup)
  notices: Notice[];

  @OneToOne(() => Goal, (goal) => goal.noticeGroup)
  goal: Goal;
}
