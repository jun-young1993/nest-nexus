import { NoticeReply } from 'src/notice/entities/notice-reply.entity';
import { NoticeGroup } from 'src/notice/entities/notice-group.entity';
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

  @OneToMany(() => NoticeReply, (noticeReply) => noticeReply.notice)
  noticeReplies: NoticeReply[];
}
