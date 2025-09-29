import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { S3Object } from './s3-object.entity';

@Entity()
export class S3ObjectTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '#FFFFFF' })
  color: string;

  @Column()
  type: string;

  @ManyToMany(() => S3Object, (s3Object) => s3Object.tags)
  s3Objects: S3Object[];
}
