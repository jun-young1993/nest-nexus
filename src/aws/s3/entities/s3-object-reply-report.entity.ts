import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { S3ObjectReply } from './s3-object-reply.entity';
import { NoticeReportType } from 'src/notice/enum/notice-report-type.enum';

@Entity()
export class S3ObjectReplyReport {
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

  @ManyToOne(() => S3ObjectReply, (s3ObjectReply) => s3ObjectReply.reports)
  s3ObjectReply: S3ObjectReply;

  @CreateDateColumn()
  createdAt: Date;
}
