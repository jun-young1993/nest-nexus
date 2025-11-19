import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { S3Object } from './s3-object.entity';

@Entity()
export class S3ObjectMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  caption?: string;

  @OneToOne(() => S3Object, (s3Object) => s3Object.metadata)
  s3Object: S3Object;
}
