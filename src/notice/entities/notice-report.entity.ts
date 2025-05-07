import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Notice } from './notice.entity';
import { NoticeReportType } from '../enum/notice-report-type.enum';

@Entity()
export class NoticeReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NoticeReportType,
    default: NoticeReportType.ETC,
  })
  type: NoticeReportType;

  @Column('text')
  content: string;

  @Column()
  reporterId: string;

  @ManyToOne(() => Notice, (notice) => notice.reports)
  notice: Notice;

  @CreateDateColumn()
  createdAt: Date;
}
