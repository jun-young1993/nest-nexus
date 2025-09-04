import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { NoticeReportType } from '../enum/notice-report-type.enum';
import { NoticeReply } from './notice-reply.entity';

@Entity()
export class NoticeReplyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NoticeReportType,
    default: NoticeReportType.ETC,
  })
  type: NoticeReportType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column()
  reporterId: string;

  @ManyToOne(() => NoticeReply, (noticeReply) => noticeReply.reports)
  noticeReply: NoticeReply;

  @CreateDateColumn()
  createdAt: Date;
}
