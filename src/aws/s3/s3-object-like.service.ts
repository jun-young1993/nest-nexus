import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ObjectLike } from './entities/s3-object-like.entity';
import { S3Object } from './entities/s3-object.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateS3ObjectLikeDto } from './dto/create-s3-object-like.dto';

@Injectable()
export class S3ObjectLikeService {
  constructor(
    @InjectRepository(S3ObjectLike)
    private readonly s3ObjectLikeRepository: Repository<S3ObjectLike>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  /**
   * S3 객체에 좋아요를 추가합니다.
   */
  async createLike(
    createS3ObjectLikeDto: CreateS3ObjectLikeDto,
    user: User,
  ): Promise<S3ObjectLike> {
    const { s3ObjectId } = createS3ObjectLikeDto;
    const userId = user.id;

    // S3 객체가 존재하는지 확인
    const s3Object = await this.s3ObjectRepository.findOne({
      where: { id: s3ObjectId, active: true },
    });
    if (!s3Object) {
      throw new NotFoundException('S3 객체를 찾을 수 없습니다.');
    }

    // 이미 좋아요가 존재하는지 확인
    const existingLike = await this.s3ObjectLikeRepository.findOne({
      where: { s3ObjectId, userId },
    });
    if (existingLike) {
      throw new ConflictException('이미 좋아요를 누른 상태입니다.');
    }

    const like = this.s3ObjectLikeRepository.create({
      s3ObjectId,
      userId,
      s3Object,
      user,
    });

    return await this.s3ObjectLikeRepository.save(like);
  }

  /**
   * S3 객체의 좋아요를 취소합니다.
   */
  async removeLike(s3ObjectId: string, userId: string): Promise<void> {
    const like = await this.s3ObjectLikeRepository.findOne({
      where: { s3ObjectId, userId },
    });

    if (!like) {
      throw new NotFoundException('좋아요를 찾을 수 없습니다.');
    }

    await this.s3ObjectLikeRepository.remove(like);
  }

  /**
   * 특정 S3 객체의 좋아요 목록을 조회합니다.
   */
  async getLikesByS3ObjectId(s3ObjectId: string): Promise<S3ObjectLike[]> {
    return await this.s3ObjectLikeRepository.find({
      where: { s3ObjectId },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  /**
   * 특정 사용자의 좋아요 목록을 조회합니다.
   */
  async getLikesByUserId(userId: string): Promise<S3ObjectLike[]> {
    return await this.s3ObjectLikeRepository.find({
      where: { userId },
      relations: ['s3Object'],
      order: { id: 'DESC' },
    });
  }

  /**
   * 특정 S3 객체의 좋아요 개수를 조회합니다.
   */
  async getLikeCountByS3ObjectId(s3ObjectId: string): Promise<number> {
    return await this.s3ObjectLikeRepository.count({
      where: { s3ObjectId },
    });
  }

  /**
   * 사용자가 특정 S3 객체에 좋아요를 눌렀는지 확인합니다.
   */
  async hasUserLikedS3Object(
    s3ObjectId: string,
    userId: string,
  ): Promise<boolean> {
    const like = await this.s3ObjectLikeRepository.findOne({
      where: { s3ObjectId, userId },
    });
    return !!like;
  }

  /**
   * 특정 S3 객체의 모든 좋아요를 삭제합니다.
   */
  async removeAllLikesByS3ObjectId(s3ObjectId: string): Promise<void> {
    await this.s3ObjectLikeRepository.delete({ s3ObjectId });
  }

  /**
   * 특정 좋아요를 삭제합니다.
   */
  async removeLikeById(likeId: string, user: User): Promise<void> {
    await this.s3ObjectLikeRepository.delete({ id: likeId, userId: user.id });
  }
}
