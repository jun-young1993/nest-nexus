import { NoticeReply } from 'src/notice/entities/notice-reply.entity';
import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
import { NoticeReport } from './notice-report.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeType } from '../enum/notice.type';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: NoticeType,
    default: NoticeType.NORMAL,
  })
  type: NoticeType;

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

  @OneToMany(() => NoticeReply, (noticeReply) => noticeReply.notice)
  noticeReplies: NoticeReply[];

  @OneToMany(() => NoticeReport, (report) => report.notice)
  reports: NoticeReport[];
}
