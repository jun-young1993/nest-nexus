import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { S3ObjectTag } from './s3-object-tag.entity';
import { S3ObjectLike } from './s3-object-like.entity';
import { S3ObjectReply } from './s3-object-reply.entity';
import { S3ObjectReport } from './s3-object-report.entity';
import { FileType, getFileType } from 'src/utils/file-type.util';
import { Exclude, Expose } from 'class-transformer';
import { S3ObjectDestinationType } from '../enum/s3-object-destination.type';
import { AwsS3AppNames } from 'src/config/config.type';
import { S3ObjectMetadata } from './s3-object-metadata.entity';

@Entity()
export class S3Object {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  key?: string;

  @Column({ nullable: true, type: 'text' })
  url?: string;

  @Column({ nullable: false })
  originalName?: string;

  @Column({ nullable: false })
  size?: number;

  @Column({ nullable: true })
  mimetype?: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ nullable: true, type: 'datetime', precision: 6 })
  presignedUrlExpiresAt?: Date;

  @Column({ nullable: false, default: S3ObjectDestinationType.UPLOAD })
  destination: S3ObjectDestinationType;

  @Column({ nullable: false })
  appName: AwsS3AppNames;

  @CreateDateColumn()
  createdAt: Date; // 데이터베이스 저장 날짜

  @DeleteDateColumn()
  deletedAt?: Date; // Soft Delete를 위한 삭제 날짜

  // ✨ 썸네일 관계 (양방향)
  @OneToOne(() => S3Object, (s3Object) => s3Object.videoSource, {
    nullable: true,
    cascade: true, // 비디오 삭제시 썸네일도 삭제
  })
  @JoinColumn({ name: 'thumbnailId' })
  thumbnail?: S3Object;

  // ✨ 순환 참조 방지: videoSource는 JSON 응답에서 제외
  // ✨ ClassSerializerInterceptor 추가
  // app.useGlobalInterceptors(
  //   new ClassSerializerInterceptor(app.get(Reflector))
  // );

  @Exclude()
  @OneToOne(() => S3Object, (s3Object) => s3Object.thumbnail)
  videoSource?: S3Object;

  @ManyToOne(() => User, (user) => user.s3Objects)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => S3ObjectTag, (tag) => tag.s3Objects)
  @JoinTable()
  tags: S3ObjectTag[];

  @OneToMany(() => S3ObjectLike, (like) => like.s3Object)
  likes: S3ObjectLike[];

  @OneToMany(() => S3ObjectReply, (reply) => reply.s3Object)
  replies: S3ObjectReply[];

  @OneToMany(() => S3ObjectReport, (report) => report.s3Object)
  reports: S3ObjectReport[];

  @OneToOne(() => S3ObjectMetadata, (metadata) => metadata.s3Object)
  @JoinColumn({ name: 'metadataId' })
  metadata: S3ObjectMetadata;

  // 계산된 필드 (가상 컬럼)
  /**
   * 파일 타입 (image, video, audio, document, archive, unknown)
   * originalName의 확장자를 기반으로 자동 계산
   */
  @Expose()
  get fileType(): FileType {
    return getFileType(this.originalName);
  }

  /**
   * 이미지 파일 여부
   */
  @Expose()
  get isImage(): boolean {
    return this.fileType === FileType.IMAGE;
  }

  /**
   * 비디오 파일 여부
   */
  @Expose()
  get isVideo(): boolean {
    return this.fileType === FileType.VIDEO;
  }

  /**
   * 오디오 파일 여부
   */
  @Expose()
  get isAudio(): boolean {
    return this.fileType === FileType.AUDIO;
  }

  /**
   * 문서 파일 여부
   */
  @Expose()
  get isDocument(): boolean {
    return this.fileType === FileType.DOCUMENT;
  }

  /**
   * 압축 파일 여부
   */
  @Expose()
  get isArchive(): boolean {
    return this.fileType === FileType.ARCHIVE;
  }

  /**
   * 썸네일 이미지 여부
   * videoSource가 있으면 이 객체는 썸네일
   */
  @Expose()
  get isThumbnail(): boolean {
    return (
      !!this.videoSource ||
      this.destination === S3ObjectDestinationType.THUMBNAIL
    );
  }

  /**
   * 썸네일 보유 여부
   * 비디오 파일이 썸네일을 가지고 있는지 확인
   */
  @Expose()
  get hasThumbnail(): boolean {
    return !!this.thumbnail;
  }

  @Expose()
  get thumbnailUrl(): string | null {
    return `${process.env.APP_DOMAIN}/aws/s3/objects/${this.id}/thumbnail`;
  }
}
