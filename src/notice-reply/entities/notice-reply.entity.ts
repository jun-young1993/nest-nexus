import { Notice } from 'src/notice/entities/notice.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column()
  userName: string;

  @CreateDateColumn()
  createdAt: Date;
}
