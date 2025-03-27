import { Notice } from 'src/notice/entities/notice.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NoticeGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Notice, (notice) => notice.noticeGroup)
  notices: Notice[];
}
