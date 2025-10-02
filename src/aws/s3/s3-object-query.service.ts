import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { S3Object } from './entities/s3-object.entity';

@Injectable()
export class S3ObjectQueryService {
  constructor(
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  /**
   * 활성화된 S3Object만 조회하는 QueryBuilder 생성
   */
  createActiveQueryBuilder(alias?: string): SelectQueryBuilder<S3Object> {
    const qb = this.s3ObjectRepository.createQueryBuilder(alias || 's3Object');
    return qb.where(`${alias || 's3Object'}.active = :active`, { active: true });
  }

  /**
   * 활성화된 S3Object 조회 (관계 포함)
   */
  async findActiveWithRelations(
    relations: string[] = ['tags', 'likes', 'replies', 'replies.user'],
  ): Promise<S3Object[]> {
    return this.createActiveQueryBuilder()
      .leftJoinAndSelect('s3Object.tags', 'tags')
      .leftJoinAndSelect('s3Object.likes', 'likes')
      .leftJoinAndSelect('s3Object.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'user')
      .orderBy('replies.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 특정 ID의 활성화된 S3Object 조회
   */
  async findActiveById(id: string): Promise<S3Object | null> {
    return this.createActiveQueryBuilder()
      .leftJoinAndSelect('s3Object.tags', 'tags')
      .leftJoinAndSelect('s3Object.likes', 'likes')
      .leftJoinAndSelect('s3Object.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'user')
      .where('s3Object.id = :id', { id })
      .getOne();
  }

  /**
   * 사용자별 활성화된 S3Object 개수 조회
   */
  async countActiveByUser(userId: string): Promise<number> {
    return this.createActiveQueryBuilder()
      .where('s3Object.userId = :userId', { userId })
      .getCount();
  }

  /**
   * 활성화된 S3Object 페이징 조회
   */
  async findActiveWithPagination(
    page: number = 1,
    limit: number = 10,
    relations: string[] = ['tags', 'likes'],
  ): Promise<{ data: S3Object[]; total: number; page: number; limit: number }> {
    const qb = this.createActiveQueryBuilder()
      .leftJoinAndSelect('s3Object.tags', 'tags')
      .leftJoinAndSelect('s3Object.likes', 'likes')
      .orderBy('s3Object.createdAt', 'DESC');

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}

