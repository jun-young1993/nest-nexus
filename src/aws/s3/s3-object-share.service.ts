import { InjectRepository } from '@nestjs/typeorm';
import { S3ObjectShare } from './entities/s3-object-share.entity';
import { In, Repository } from 'typeorm';
import { CreateS3ObjectShareDto } from './dto/create-s3-object-share';
import { S3Object } from './entities/s3-object.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';

export class S3ObjectShareService {
  constructor(
    @InjectRepository(S3ObjectShare)
    private readonly s3ObjectShareRepository: Repository<S3ObjectShare>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createS3ObjectShareDto: CreateS3ObjectShareDto, user: User) {
    const s3Objects = await this.s3ObjectRepository.find({
      where: {
        id: In(createS3ObjectShareDto.s3ObjectId),
        user: {
          id: user.id,
        },
      },
    });
    if (s3Objects.length === 0) {
      throw new NotFoundException('S3 객체를 찾을 수 없거나 권한이 없습니다.');
    }
    this.awsS3Service.generateGetObjectPresigendUrls(s3Objects, true);
    const entity = this.s3ObjectShareRepository.create({
      shareCode: createS3ObjectShareDto.shareCode,
      expiredAt: createS3ObjectShareDto.expiredAt,
      s3Object: s3Objects,
      title: createS3ObjectShareDto.title,
      user: user,
    });
    return this.s3ObjectShareRepository.save(entity);
  }

  async findOne(id: string, skip?: number, take?: number) {
    const share = await this.s3ObjectShareRepository.findOne({
      relations: ['user', 'user.userGroups'],
      where: {
        id: id,
      },
    });
    if (!share) {
      throw new NotFoundException('S3 객체 공유를 찾을 수 없습니다.');
    }

    // s3Object를 페이징 조회
    const skipValue = skip || 0;
    const takeValue = take || 10;

    const [s3Objects, total] = await this.s3ObjectRepository
      .createQueryBuilder('s3Object')
      .leftJoinAndSelect('s3Object.thumbnail', 'thumbnail')
      .leftJoinAndSelect('s3Object.lowRes', 'lowRes')
      .leftJoinAndSelect('s3Object.tags', 'tags')
      .leftJoinAndSelect('s3Object.user', 'user')
      .leftJoinAndSelect('s3Object.metadata', 'metadata')
      .leftJoinAndSelect('s3Object.likes', 'likes')
      .leftJoinAndSelect('s3Object.replies', 'replies')
      .leftJoinAndSelect('s3Object.reports', 'reports')
      .innerJoin(
        's3_object_share_s3_object',
        'share_s3',
        'share_s3.s3ObjectId = s3Object.id',
      )
      .where('share_s3.s3ObjectShareId = :shareId', { shareId: id })
      .orderBy('s3Object.createdAt', 'DESC')
      .skip(skipValue)
      .take(takeValue)
      .getManyAndCount();

    // Presigned URL 생성
    const s3ObjectsWithUrls =
      await this.awsS3Service.generateGetObjectPresigendUrls(s3Objects);

    return {
      ...share,
      s3Object: s3ObjectsWithUrls,
      pagination: {
        total,
        skip: skipValue,
        take: takeValue,
        totalPages: Math.ceil(total / takeValue),
      },
    };
  }
}
