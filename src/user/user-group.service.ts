import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserGroup } from './entities/user-group.entity';
import { User } from './entities/user.entity';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { AddUserToGroupDto } from './dto/add-user-to-group.dto';
import { RemoveUserFromGroupDto } from './dto/remove-user-from-group.dto';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 새로운 사용자 그룹 생성
   */
  async create(
    user: User,
    createUserGroupDto: CreateUserGroupDto,
    number: string,
  ): Promise<UserGroup> {
    // 그룹 이름 중복 확인

    const existingUserGroup = await this.findGroupsByUserId(user.id);
    if (existingUserGroup) {
      throw new BadRequestException(
        `Group with name '${existingUserGroup.name}' already exists`,
      );
    }

    user.isAdmin = true;
    await this.userRepository.save(user);

    const userGroup = this.userGroupRepository.create({
      ...createUserGroupDto,
      isActive: createUserGroupDto.isActive ?? true,
      isSystem: createUserGroupDto.isSystem ?? false,
      number,
      users: [user],
    });

    return await this.userGroupRepository.save(userGroup);
  }

  /**
   * 사용자의 첫 번째 그룹 조회
   */
  async findOneByUserId(user: User): Promise<UserGroup | null> {
    return await this.userGroupRepository.findOne({
      where: { users: { id: user.id } },
      relations: ['users'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 활성 상태인 사용자의 첫 번째 그룹 조회
   */
  async findActiveGroupByUserId(user: User): Promise<UserGroup | null> {
    return await this.userGroupRepository.findOne({
      where: { isActive: true, users: { id: user.id } },
      relations: ['users'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ID로 특정 그룹 조회
   */
  async findOne(id: string): Promise<UserGroup> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!userGroup) {
      throw new NotFoundException(`User group with ID '${id}' not found`);
    }

    return userGroup;
  }

  /**
   * 이름으로 그룹 조회
   */
  async findByName(name: string): Promise<UserGroup | null> {
    return await this.userGroupRepository.findOne({
      where: { name },
      relations: ['users'],
    });
  }

  /**
   * 사용자 그룹 정보 수정
   */
  async update(
    id: string,
    updateUserGroupDto: UpdateUserGroupDto,
  ): Promise<UserGroup> {
    const userGroup = await this.findOne(id);

    // 시스템 그룹은 수정 불가
    if (userGroup.isSystem) {
      throw new BadRequestException('System groups cannot be modified');
    }

    // 이름 변경 시 중복 확인
    if (updateUserGroupDto.name && updateUserGroupDto.name !== userGroup.name) {
      const existingGroup = await this.findByName(updateUserGroupDto.name);
      if (existingGroup) {
        throw new BadRequestException(
          `Group with name '${updateUserGroupDto.name}' already exists`,
        );
      }
    }

    Object.assign(userGroup, updateUserGroupDto);
    return await this.userGroupRepository.save(userGroup);
  }

  /**
   * 사용자 그룹 삭제
   */
  async remove(id: string): Promise<void> {
    const userGroup = await this.findOne(id);

    // 시스템 그룹은 삭제 불가
    if (userGroup.isSystem) {
      throw new BadRequestException('System groups cannot be deleted');
    }

    // 그룹에 사용자가 있으면 삭제 불가
    if (userGroup.users && userGroup.users.length > 0) {
      throw new BadRequestException(
        'Cannot delete group with active members. Remove all members first.',
      );
    }

    await this.userGroupRepository.remove(userGroup);
  }

  /**
   * 사용자를 그룹에 추가
   */
  async addUsersToGroup(
    addUserToGroupDto: AddUserToGroupDto,
  ): Promise<UserGroup> {
    const { groupId, userIds } = addUserToGroupDto;

    const userGroup = await this.findOne(groupId);
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    if (users.length !== userIds.length) {
      const foundIds = users.map((user) => user.id);
      const missingIds = userIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Users not found: ${missingIds.join(', ')}`);
    }

    // 이미 그룹에 속한 사용자 제외
    const existingUserIds = userGroup.users.map((user) => user.id);
    const newUsers = users.filter((user) => !existingUserIds.includes(user.id));

    if (newUsers.length === 0) {
      throw new BadRequestException(
        'All specified users are already members of this group',
      );
    }

    userGroup.users = [...userGroup.users, ...newUsers];
    return await this.userGroupRepository.save(userGroup);
  }

  /**
   * 사용자를 그룹에서 제거
   */
  async removeUsersFromGroup(
    removeUserFromGroupDto: RemoveUserFromGroupDto,
  ): Promise<UserGroup> {
    const { groupId, userIds } = removeUserFromGroupDto;

    const userGroup = await this.findOne(groupId);

    // 그룹에 속하지 않은 사용자 필터링
    const existingUserIds = userGroup.users.map((user) => user.id);
    const validUserIds = userIds.filter((id) => existingUserIds.includes(id));

    if (validUserIds.length === 0) {
      throw new BadRequestException(
        'None of the specified users are members of this group',
      );
    }

    // 사용자 제거
    userGroup.users = userGroup.users.filter(
      (user) => !validUserIds.includes(user.id),
    );
    return await this.userGroupRepository.save(userGroup);
  }

  /**
   * 사용자가 속한 그룹들 조회
   */
  async findGroupsByUserId(userId: string): Promise<UserGroup | null> {
    return await this.userGroupRepository.findOne({
      where: { users: { id: userId }, isActive: true },
      relations: ['users'],
    });
  }

  async findGroupsByUserIdOrFail(userId: string): Promise<UserGroup> {
    const userGroup = await this.findGroupsByUserId(userId);
    if (!userGroup) {
      throw new NotFoundException(`User group with ID '${userId}' not found`);
    }
    return userGroup;
  }

  /**
   * 그룹에 속한 사용자들 조회
   */
  async findUsersByGroupId(groupId: string): Promise<User[]> {
    const userGroup = await this.findOne(groupId);
    return userGroup.users;
  }

  /**
   * 그룹 멤버 수 조회
   */
  async getGroupMemberCount(groupId: string): Promise<number> {
    const userGroup = await this.findOne(groupId);
    return userGroup.users.length;
  }

  async findGroupAdminByUser(user: User): Promise<User | null> {
    const userGroup = await this.findGroupsByUserId(user.id);
    if (!userGroup) {
      return null;
    }
    return userGroup.users.find((user) => user.isAdmin) ?? null;
  }

  async findGroupByNumber(number: string): Promise<UserGroup | null> {
    return await this.userGroupRepository.findOne({
      where: { number },
    });
  }
}
