import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { UserBlock, BlockStatus } from './entities/user-block.entity';
import { CreateUserBlockDto } from './dto/create-user-block.dto';
import { UpdateUserBlockDto } from './dto/update-user-block.dto';
import { UnblockUserDto } from './dto/unblock-user.dto';

@Injectable()
export class UserBlockService {
  private readonly logger = new Logger(UserBlockService.name);

  constructor(
    @InjectRepository(UserBlock)
    private readonly userBlockRepository: Repository<UserBlock>,
  ) {}

  /**
   * 사용자 블록 생성
   */
  async createUserBlock(
    blockerId: string,
    createUserBlockDto: CreateUserBlockDto,
  ): Promise<UserBlock> {
    const { blockedId, reason, status = BlockStatus.ACTIVE } = createUserBlockDto;

    // 자기 자신을 블록하는 것 방지
    if (blockerId === blockedId) {
      throw new BadRequestException('자기 자신을 블록할 수 없습니다.');
    }

    // 이미 블록된 사용자인지 확인
    const existingBlock = await this.userBlockRepository.findOne({
      where: {
        blockerId,
        blockedId,
        status: BlockStatus.ACTIVE,
      },
    });

    if (existingBlock) {
      throw new BadRequestException('이미 해당 사용자를 블록했습니다.');
    }

    const userBlock = this.userBlockRepository.create({
      blockerId,
      blockedId,
      reason,
      status,
    });

    const savedBlock = await this.userBlockRepository.save(userBlock);
    this.logger.log(`사용자 블록 생성: ${blockerId} -> ${blockedId}`);

    return savedBlock;
  }

  /**
   * 사용자 블록 목록 조회
   */
  async getUserBlocks(
    blockerId: string,
    options?: FindManyOptions<UserBlock>,
    optionsWhere?: FindOptionsWhere<UserBlock>,
  ): Promise<UserBlock[]> {
    const where: FindOptionsWhere<UserBlock> = {
      blockerId,
      ...optionsWhere,
    };

    return this.userBlockRepository.find({
      where,
      relations: ['blocked'],
      order: { createdAt: 'DESC' },
      ...options,
    });
  }

  /**
   * 특정 사용자 블록 조회
   */
  async getUserBlock(
    blockerId: string,
    blockedId: string,
  ): Promise<UserBlock | null> {
    return this.userBlockRepository.findOne({
      where: {
        blockerId,
        blockedId,
      },
      relations: ['blocked'],
    });
  }

  /**
   * 사용자 블록 해제
   */
  async unblockUser(
    blockerId: string,
    blockedId: string,
    unblockUserDto: UnblockUserDto,
  ): Promise<UserBlock> {
    const userBlock = await this.userBlockRepository.findOne({
      where: {
        blockerId,
        blockedId,
        status: BlockStatus.ACTIVE,
      },
    });

    if (!userBlock) {
      throw new NotFoundException('블록된 사용자를 찾을 수 없습니다.');
    }

    userBlock.status = BlockStatus.INACTIVE;
    userBlock.unblockedAt = new Date();
    userBlock.unblockReason = unblockUserDto.unblockReason;

    const updatedBlock = await this.userBlockRepository.save(userBlock);
    this.logger.log(`사용자 블록 해제: ${blockerId} -> ${blockedId}`);

    return updatedBlock;
  }

  /**
   * 사용자 블록 삭제 (완전 삭제)
   */
  async removeUserBlock(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    const userBlock = await this.userBlockRepository.findOne({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (!userBlock) {
      throw new NotFoundException('블록 정보를 찾을 수 없습니다.');
    }

    await this.userBlockRepository.remove(userBlock);
    this.logger.log(`사용자 블록 삭제: ${blockerId} -> ${blockedId}`);
  }

  /**
   * 사용자가 특정 사용자를 블록했는지 확인
   */
  async isUserBlocked(
    blockerId: string,
    blockedId: string,
  ): Promise<boolean> {
    const userBlock = await this.userBlockRepository.findOne({
      where: {
        blockerId,
        blockedId,
        status: BlockStatus.ACTIVE,
      },
    });

    return !!userBlock;
  }

  /**
   * 사용자가 블록한 사용자 목록 조회
   */
  async getBlockedUsers(blockerId: string): Promise<UserBlock[]> {
    return this.userBlockRepository.find({
      where: {
        blockerId,
        status: BlockStatus.ACTIVE,
      },
      relations: ['blocked'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 사용자를 블록한 사용자 목록 조회
   */
  async getBlockers(blockedId: string): Promise<UserBlock[]> {
    return this.userBlockRepository.find({
      where: {
        blockedId,
        status: BlockStatus.ACTIVE,
      },
      relations: ['blocker'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 사용자 블록 통계 조회
   */
  async getUserBlockStats(userId: string): Promise<{
    blockedCount: number;
    blockerCount: number;
    totalBlocks: number;
  }> {
    const [blockedCount, blockerCount, totalBlocks] = await Promise.all([
      this.userBlockRepository.count({
        where: {
          blockerId: userId,
          status: BlockStatus.ACTIVE,
        },
      }),
      this.userBlockRepository.count({
        where: {
          blockedId: userId,
          status: BlockStatus.ACTIVE,
        },
      }),
      this.userBlockRepository
        .createQueryBuilder('userBlock')
        .where('userBlock.blockerId = :userId OR userBlock.blockedId = :userId', { userId })
        .getCount(),
    ]);

    return {
      blockedCount,
      blockerCount,
      totalBlocks,
    };
  }
}
