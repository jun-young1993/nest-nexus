import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@ObjectType()
@Entity('user_groups')
export class UserGroup {
  @ApiProperty({
    description: 'Unique identifier for the user group',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the user group (must be unique)',
    example: 'Developers',
    maxLength: 100,
  })
  @Field()
  @Column({ length: 100, unique: true })
  name: string; // 그룹 이름 (유니크)

  @ApiProperty({
    description: 'Description of the user group',
    example: 'Development team members',
    maxLength: 500,
    nullable: true,
  })
  @Field()
  @Column({ length: 500, nullable: true })
  description: string; // 그룹 설명

  @ApiProperty({
    description: 'Whether the group is active',
    example: true,
    default: true,
  })
  @Field()
  @Column({ default: true })
  isActive: boolean; // 그룹 활성 상태

  @ApiProperty({
    description: 'Whether this is a system group (cannot be modified/deleted)',
    example: false,
    default: false,
  })
  @Field()
  @Column({ default: false })
  isSystem: boolean; // 시스템 그룹 여부 (삭제 방지)

  @ApiProperty({
    description: 'When the group was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Field()
  @CreateDateColumn()
  createdAt: Date; // 생성 날짜

  @ApiProperty({
    description: 'When the group was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Field()
  @UpdateDateColumn()
  updatedAt: Date; // 수정 날짜

  // Many-to-Many 관계: User와 UserGroup
  @ApiProperty({
    description: 'Users that belong to this group',
    type: [User],
    example: [],
  })
  @ManyToMany(() => User, (user) => user.userGroups)
  @JoinTable({
    name: 'user_group_members', // 중간 테이블 이름
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[]; // 그룹에 속한 사용자들
}
