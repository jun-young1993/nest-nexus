import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  UserStorageLimit,
  StorageLimitType,
} from './entities/user-storage-limit.entity';
import { CreateUserStorageLimitDto } from './dto/create-user-storage-limit.dto';
import { UpdateUserStorageLimitDto } from './dto/update-user-storage-limit.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserStorageLimitService {
  constructor(
    @InjectRepository(UserStorageLimit)
    private readonly userStorageLimitRepository: Repository<UserStorageLimit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 사용자 스토리지 제한 생성
   */
  async create(
    createDto: CreateUserStorageLimitDto,
  ): Promise<UserStorageLimit> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID '${createDto.userId}' not found`,
      );
    }

    // 같은 타입의 제한이 이미 있는지 확인
    const existingLimit = await this.userStorageLimitRepository.findOne({
      where: {
        userId: createDto.userId,
        limitType: createDto.limitType,
      },
    });

    if (existingLimit) {
      throw new BadRequestException(
        `Storage limit of type '${createDto.limitType}' already exists for this user`,
      );
    }

    const storageLimit = this.userStorageLimitRepository.create({
      ...createDto,
      expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
      isActive: createDto.isActive ?? true,
    });

    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 사용자의 모든 스토리지 제한 조회
   */
  async findByUserId(users: User[]): Promise<UserStorageLimit[]> {
    const userId = users.filter((user) => user).map((user) => user.id);
    return await this.userStorageLimitRepository.find({
      where: { userId: In(userId) },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 특정 타입의 스토리지 제한 조회
   */
  async findByUserIdAndType(
    users: User[],
    limitType: StorageLimitType,
  ): Promise<UserStorageLimit | null> {
    const userId = users.filter((user) => user).map((user) => user.id);
    return await this.userStorageLimitRepository.findOne({
      where: { userId: In(userId), limitType },
    });
  }

  /**
   * 특정 타입의 스토리지 제한 조회 (실패 시 예외 발생)
   */
  async findByUserAndTypeOrFail(
    users: User[],
    limitType: StorageLimitType,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserIdAndType(users, limitType);
    if (!storageLimit) {
      throw new NotFoundException(
        `Storage limit of type '${limitType}' not found for user '${users.filter((user) => user).map((user) => user.id)}'`,
      );
    }
    return storageLimit;
  }

  /**
   * 스토리지 제한 업데이트
   */
  async update(
    id: string,
    updateDto: UpdateUserStorageLimitDto,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.userStorageLimitRepository.findOne({
      where: { id },
    });

    if (!storageLimit) {
      throw new NotFoundException(`Storage limit with ID '${id}' not found`);
    }

    if (updateDto.expiresAt) {
      updateDto.expiresAt = new Date(updateDto.expiresAt).toISOString();
    }

    await this.userStorageLimitRepository.update(id, {
      ...updateDto,
      expiresAt: updateDto.expiresAt
        ? new Date(updateDto.expiresAt)
        : storageLimit.expiresAt,
    });

    return await this.userStorageLimitRepository.findOne({ where: { id } });
  }

  /**
   * 현재 사용량 업데이트
   */
  async updateCurrentUsage(
    users: User[],
    limitType: StorageLimitType,
    newUsage: number,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserIdAndType(users, limitType);

    if (!storageLimit) {
      throw new NotFoundException(
        `Storage limit of type '${limitType}' not found for user '${users.filter((user) => user).map((user) => user.id)}'`,
      );
    }

    storageLimit.currentUsage = newUsage;
    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 사용량 증가
   */
  async increaseUsage(
    users: User[],
    limitType: StorageLimitType,
    increment: number,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserIdAndType(users, limitType);

    if (!storageLimit) {
      throw new NotFoundException(
        `Storage limit of type '${limitType}' not found for user '${users.filter((user) => user).map((user) => user.id)}'`,
      );
    }

    storageLimit.currentUsage += increment;
    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 사용량 감소
   */
  async decreaseUsage(
    users: User[],
    limitType: StorageLimitType,
    decrement: number,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserIdAndType(users, limitType);

    if (!storageLimit) {
      throw new NotFoundException(
        `Storage limit of type '${limitType}' not found for user '${users.filter((user) => user).map((user) => user.id)}'`,
      );
    }

    storageLimit.currentUsage = Math.max(
      0,
      storageLimit.currentUsage - decrement,
    );
    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 파일 크기 추가 (엔티티 메서드 사용)
   */
  async addFileSize(
    user: User,
    limitType: StorageLimitType,
    fileSize: number,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserAndTypeOrFail([user], limitType);

    // 엔티티의 addFileSize 메서드 사용
    storageLimit.addFileSize(fileSize);

    // 데이터베이스에 저장
    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 파일 크기 감소 (엔티티 메서드 사용)
   */
  async decreaseFileSize(
    user: User,
    limitType: StorageLimitType,
    fileSize: number,
  ): Promise<UserStorageLimit> {
    const storageLimit = await this.findByUserAndTypeOrFail([user], limitType);
    storageLimit.decreaseFileSize(fileSize);
    return await this.userStorageLimitRepository.save(storageLimit);
  }

  /**
   * 제한 초과 여부 확인
   */
  async isOverLimit(
    users: User[],
    limitType: StorageLimitType,
    additionalUsage: number = 0,
  ): Promise<{
    isOverLimit: boolean;
    currentUsage: number;
    limitValue: number;
    remainingSpace: number;
  }> {
    const storageLimit = await this.findByUserIdAndType(users, limitType);

    if (!storageLimit || !storageLimit.isActive || storageLimit.isExpired) {
      return {
        isOverLimit: false,
        currentUsage: 0,
        limitValue: 0,
        remainingSpace: 0,
      };
    }

    const totalUsage = storageLimit.currentUsage + additionalUsage;
    const isOverLimit = totalUsage > storageLimit.limitValue;
    const remainingSpace = Math.max(0, storageLimit.limitValue - totalUsage);

    return {
      isOverLimit,
      currentUsage: storageLimit.currentUsage,
      limitValue: storageLimit.limitValue,
      remainingSpace,
    };
  }

  /**
   * 스토리지 제한 삭제
   */
  async remove(id: string): Promise<void> {
    const result = await this.userStorageLimitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Storage limit with ID '${id}' not found`);
    }
  }

  /**
   * 만료된 제한들 정리
   */
  async cleanupExpiredLimits(): Promise<number> {
    const result = await this.userStorageLimitRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  /**
   * 기본 제한 설정 (새 사용자용)
   */
  async createDefaultLimits(
    user: User,
    {
      limitType,
      limitValue,
      description,
    }: {
      limitType: StorageLimitType;
      limitValue: number;
      description: string;
    },
  ): Promise<UserStorageLimit> {
    const userId = user.id;

    return await this.create({
      userId,
      limitType: limitType,
      limitValue: limitValue, // 1GB
      description: description,
    });
  }
}
