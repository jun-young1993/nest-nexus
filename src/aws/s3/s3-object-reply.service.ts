import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3ObjectReply } from './entities/s3-object-reply.entity';
import { S3Object } from './entities/s3-object.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateS3ObjectReplyDto } from './dto/create-s3-object-reply.dto';
import { UpdateS3ObjectReplyDto } from './dto/update-s3-object-reply.dto';

@Injectable()
export class S3ObjectReplyService {
  constructor(
    @InjectRepository(S3ObjectReply)
    private readonly s3ObjectReplyRepository: Repository<S3ObjectReply>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  /**
   * S3 객체에 댓글을 추가합니다.
   */
  async createReply(
    createS3ObjectReplyDto: CreateS3ObjectReplyDto,
    user: User,
    s3ObjectId: string,
  ): Promise<S3ObjectReply> {
    const { content } = createS3ObjectReplyDto;
    const userId = user.id;
    // S3 객체가 존재하는지 확인
    const s3Object = await this.s3ObjectRepository.findOne({
      where: { id: s3ObjectId, active: true },
    });
    if (!s3Object) {
      throw new NotFoundException('S3 객체를 찾을 수 없습니다.');
    }

    const reply = this.s3ObjectReplyRepository.create({
      content,
      s3ObjectId,
      userId,
      s3Object,
      user,
    });

    return await this.s3ObjectReplyRepository.save(reply);
  }

  /**
   * 특정 S3 객체의 모든 댓글을 조회합니다.
   */
  async getRepliesByS3ObjectId(s3ObjectId: string): Promise<S3ObjectReply[]> {
    return await this.s3ObjectReplyRepository.find({
      where: { s3ObjectId, isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 특정 사용자의 댓글 목록을 조회합니다.
   */
  async getRepliesByUserId(userId: string): Promise<S3ObjectReply[]> {
    return await this.s3ObjectReplyRepository.find({
      where: { userId, isActive: true },
      relations: ['s3Object'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 댓글 ID로 댓글을 조회합니다.
   */
  async getReplyById(id: string): Promise<S3ObjectReply> {
    const reply = await this.s3ObjectReplyRepository.findOne({
      where: { id },
      relations: ['user', 's3Object'],
    });

    if (!reply) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return reply;
  }

  /**
   * 댓글을 수정합니다.
   */
  async updateReply(
    id: string,
    updateS3ObjectReplyDto: UpdateS3ObjectReplyDto,
    userId: string,
  ): Promise<S3ObjectReply> {
    const reply = await this.getReplyById(id);

    // 댓글 작성자인지 확인
    if (reply.userId !== userId) {
      throw new NotFoundException('댓글을 수정할 권한이 없습니다.');
    }

    reply.content = updateS3ObjectReplyDto.content;
    return await this.s3ObjectReplyRepository.save(reply);
  }

  /**
   * 댓글을 삭제합니다 (소프트 삭제).
   */
  async removeReply(id: string, userId: string): Promise<void> {
    const reply = await this.getReplyById(id);

    // 댓글 작성자인지 확인
    if (reply.userId !== userId) {
      throw new NotFoundException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.s3ObjectReplyRepository.remove(reply);
  }

  /**
   * 특정 S3 객체의 댓글 개수를 조회합니다.
   */
  async getReplyCountByS3ObjectId(s3ObjectId: string): Promise<number> {
    return await this.s3ObjectReplyRepository.count({
      where: { s3ObjectId, isActive: true },
    });
  }

  /**
   * 특정 S3 객체의 모든 댓글을 삭제합니다.
   */
  async removeAllRepliesByS3ObjectId(s3ObjectId: string): Promise<void> {
    await this.s3ObjectReplyRepository.update(
      { s3ObjectId },
      { isActive: false },
    );
  }

  /**
   * 특정 사용자의 모든 댓글을 삭제합니다.
   */
  async removeAllRepliesByUserId(userId: string): Promise<void> {
    await this.s3ObjectReplyRepository.update({ userId }, { isActive: false });
  }
}
