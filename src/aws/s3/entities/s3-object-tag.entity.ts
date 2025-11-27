import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { S3Object } from './s3-object.entity';
import { TagType } from '../enum/tag.type';

@Entity()
export class S3ObjectTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  name: string;

  @Column({ default: '#9CA3AF' })
  color: string;

  @Column({
    type: 'enum',
    enum: TagType,
    default: TagType.DEFAULT,
  })
  type: string;

  @ManyToMany(() => S3Object, (s3Object) => s3Object.tags)
  s3Objects: S3Object[];
}
