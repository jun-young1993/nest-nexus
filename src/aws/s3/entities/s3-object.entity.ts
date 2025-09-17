import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class S3Object {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  key?: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: false })
  originalName?: string;

  @Column({ nullable: false })
  size?: number;

  @Column({ nullable: true })
  mimetype?: string;

  @Column({ nullable: false, default: false })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date; // 생성 날짜

  @ManyToOne(() => User, (user) => user.s3Objects)
  @JoinColumn({ name: 'userId' })
  user: User;
}
