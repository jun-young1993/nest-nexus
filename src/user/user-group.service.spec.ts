import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupService } from './user-group.service';
import { UserGroup } from './entities/user-group.entity';
import { User } from './entities/user.entity';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { AddUserToGroupDto } from './dto/add-user-to-group.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserGroupService', () => {
  let service: UserGroupService;
  let userGroupRepository: Repository<UserGroup>;
  let userRepository: Repository<User>;

  const mockUserGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockUserRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupService,
        {
          provide: getRepositoryToken(UserGroup),
          useValue: mockUserGroupRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserGroupService>(UserGroupService);
    userGroupRepository = module.get<Repository<UserGroup>>(
      getRepositoryToken(UserGroup),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user group', async () => {
      const createDto: CreateUserGroupDto = {
        name: 'Test Group',
        description: 'Test Description',
      };

      const mockUserGroup = {
        id: 'uuid-1',
        ...createDto,
        isActive: true,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
      };

      jest.spyOn(userGroupRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userGroupRepository, 'create')
        .mockReturnValue(mockUserGroup as UserGroup);
      jest
        .spyOn(userGroupRepository, 'save')
        .mockResolvedValue(mockUserGroup as UserGroup);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUserGroup);
      expect(userGroupRepository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(userGroupRepository.create).toHaveBeenCalledWith({
        ...createDto,
        isActive: true,
        isSystem: false,
      });
    });

    it('should throw BadRequestException if group name already exists', async () => {
      const createDto: CreateUserGroupDto = {
        name: 'Existing Group',
        description: 'Test Description',
      };

      const existingGroup = { id: 'uuid-1', name: 'Existing Group' };

      jest
        .spyOn(userGroupRepository, 'findOne')
        .mockResolvedValue(existingGroup as UserGroup);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user group by id', async () => {
      const mockUserGroup = {
        id: 'uuid-1',
        name: 'Test Group',
        users: [],
      };

      jest
        .spyOn(userGroupRepository, 'findOne')
        .mockResolvedValue(mockUserGroup as UserGroup);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockUserGroup);
    });

    it('should throw NotFoundException if group not found', async () => {
      jest.spyOn(userGroupRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addUsersToGroup', () => {
    it('should add users to a group', async () => {
      const addDto: AddUserToGroupDto = {
        groupId: 'group-1',
        userIds: ['user-1', 'user-2'],
      };

      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        users: [],
      };

      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' },
      ];

      jest.spyOn(service, 'findOne').mockResolvedValue(mockGroup as UserGroup);
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers as User[]);
      jest.spyOn(userGroupRepository, 'save').mockResolvedValue({
        ...mockGroup,
        users: mockUsers,
      } as UserGroup);

      const result = await service.addUsersToGroup(addDto);

      expect(result.users).toHaveLength(2);
      expect(userRepository.find).toHaveBeenCalledWith({
        where: { id: ['user-1', 'user-2'] },
      });
    });
  });
});
