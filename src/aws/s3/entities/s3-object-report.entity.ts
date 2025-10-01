import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { S3Object } from './s3-object.entity';
import { NoticeReportType } from 'src/notice/enum/notice-report-type.enum';

@Entity()
export class S3ObjectReport {
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

  @ManyToOne(() => S3Object, (s3Object) => s3Object.reports)
  s3Object: S3Object;

  @CreateDateColumn()
  createdAt: Date;
}
