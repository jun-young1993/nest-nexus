import { Notice } from 'src/notice/entities/notice.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeReplyReport } from './notice-reply-report.entity';

@Entity()
export class NoticeReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  noticeId: string;

  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'noticeId' })
  notice: Notice;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => NoticeReplyReport, (report) => report.noticeReply)
  reports: NoticeReplyReport[];
}
