import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
