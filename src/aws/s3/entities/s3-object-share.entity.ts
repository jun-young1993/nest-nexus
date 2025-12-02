import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { S3Object } from './s3-object.entity';
import { User } from 'src/user/entities/user.entity';
import { Expose, plainToInstance } from 'class-transformer';

@Entity('s3_object_shares')
export class S3ObjectShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'datetime', precision: 6 })
  expiredAt: Date;

  @Column({ nullable: true })
  shareCode?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @BeforeInsert()
  setExpiredAt() {
    if (!this.expiredAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.expiredAt = tomorrow;
    }
  }

  @ManyToOne(() => User, (user) => user.s3ObjectShares)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => S3Object, (s3Object) => s3Object.shares)
  @JoinTable({
    name: 's3_object_share_s3_object',
    joinColumn: { name: 's3ObjectShareId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 's3ObjectId', referencedColumnName: 'id' },
  })
  s3Object: S3Object[];

  @Expose()
  get getShareUrl(): string {
    return `${process.env.APP_DOMAIN}/media/share/object/${this.id}`;
  }

  static fromJson(json: any): S3ObjectShare {
    return plainToInstance(S3ObjectShare, json);
  }
}
