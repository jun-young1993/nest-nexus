import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { S3Object } from './s3-object.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('s3_object_likes')
export class S3ObjectLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  s3ObjectId: string;

  @Column()
  userId: string;

  @ManyToOne(() => S3Object, (s3Object) => s3Object.likes)
  @JoinColumn({ name: 's3ObjectId' })
  s3Object: S3Object;

  @ManyToOne(() => User, (user) => user.s3ObjectLikes)
  @JoinColumn({ name: 'userId' })
  user: User;
}
