import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('users') // 테이블 이름 설정
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid') // UUID로 기본 키 생성
  id: string;

  @Field()
  @Column({ length: 50 })
  username: string; // 사용자 이름 (유니크)

  @Column({ select: false }) // 기본적으로 조회 시 제외
  password: string; // 비밀번호 (보안상 기본 조회에서 제외)

  @Field()
  @Column({ unique: true })
  email: string; // 이메일 (유니크)

  @Field()
  @Column({ default: true })
  isActive: boolean; // 활성 상태

  @Field()
  @CreateDateColumn()
  createdAt: Date; // 생성 날짜

  @Field()
  @UpdateDateColumn()
  updatedAt: Date; // 수정 날짜

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[]; // 작성한 게시글
}
