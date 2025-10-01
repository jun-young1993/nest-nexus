import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { S3Object } from './s3-object.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class S3ObjectReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  s3ObjectId: string;

  @Column()
  userId: string;

  @Column({ default: true })
  isActive: boolean; // 활성 상태

  @ManyToOne(() => S3Object, (s3Object) => s3Object.replies)
  @JoinColumn({ name: 's3ObjectId' })
  s3Object: S3Object;

  @ManyToOne(() => User, (user) => user.s3ObjectReplies)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
