import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../enum/user.type';
import { GoalUser } from '../../goal/entities/goal-user.entity';
import { NoticeView } from '../../notice/entities/notice-view.entity';
import { UserGroup } from './user-group.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { ApiProperty } from '@nestjs/swagger';
import { S3Object } from 'src/aws/s3/entities/s3-object.entity';

@ObjectType()
@Entity('users') // 테이블 이름 설정
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid') // UUID로 기본 키 생성
  id: string;

  @Field()
  @Column({ length: 50, nullable: true })
  username: string; // 사용자 이름 (유니크)

  @Column({ select: false }) // 기본적으로 조회 시 제외
  password: string; // 비밀번호 (보안상 기본 조회에서 제외)

  @Field()
  @Column({ nullable: true })
  email: string; // 이메일 (유니크)

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  type: UserType;

  @ApiProperty({ description: 'FCM TOKEN' })
  @Column({ nullable: true })
  fcmToken: string;

  @Field()
  @Column({ default: true })
  isActive: boolean; // 활성 상태

  @Field()
  @CreateDateColumn()
  createdAt: Date; // 생성 날짜

  @Field()
  @UpdateDateColumn()
  updatedAt: Date; // 수정 날짜

  @Column({ nullable: true, length: 45 })
  registrationIp: string; // 사용자 등록 시점의 IP 주소
  // End of Selection

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[]; // 작성한 게시글

  @OneToMany(() => GoalUser, (goalUser) => goalUser.user)
  goalUsers: GoalUser[];

  @OneToMany(() => NoticeView, (noticeView) => noticeView.user)
  noticeViews: NoticeView[];

  // Many-to-Many 관계: User와 UserGroup
  @ManyToMany(() => UserGroup, (userGroup) => userGroup.users)
  userGroups: UserGroup[]; // 사용자가 속한 그룹들

  // One-to-Many 관계: User와 Loan
  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[]; // 사용자의 대출 목록

  @OneToMany(() => S3Object, (s3Object) => s3Object.user)
  s3Objects: S3Object[];
}
