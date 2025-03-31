import { NoticeGroup } from 'src/notice-group/entities/notice-group.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: false })
  noticeGroupId: string;

  @ManyToOne(() => NoticeGroup)
  @JoinColumn({ name: 'noticeGroupId' })
  noticeGroup: NoticeGroup;

  @Column()
  userName: string;

  @Column({ default: 0 })
  viewCount: number;
}
