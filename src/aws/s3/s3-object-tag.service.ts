import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { S3ObjectTag } from './entities/s3-object-tag.entity';
import { CreateS3ObjectTagDto } from './dto/create-s3-object-tag.dto';
import { UpdateS3ObjectTagDto } from './dto/update-s3-object-tag.dto';
import { createNestLogger } from 'src/factories/logger.factory';
import { ExistingException } from 'src/core/exceptions/existing.exception';

@Injectable()
export class S3ObjectTagService {
  private readonly logger = createNestLogger(S3ObjectTagService.name);

  constructor(
    @InjectRepository(S3ObjectTag)
    private readonly s3ObjectTagRepository: Repository<S3ObjectTag>,
  ) {}

  /**
   * 새로운 S3ObjectTag 생성
   */
  async create(
    createS3ObjectTagDto: CreateS3ObjectTagDto,
  ): Promise<S3ObjectTag> {
    this.logger.log(
      `Creating S3ObjectTag with name: ${createS3ObjectTagDto.name}`,
    );

    // 이름 중복 확인 (소문자로 변환하여 비교)
    const normalizedName = createS3ObjectTagDto.name.toLowerCase();
    const existingTag = await this.s3ObjectTagRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingTag) {
      throw new ExistingException('Tag', createS3ObjectTagDto.name);
    }

    const tag = this.s3ObjectTagRepository.create({
      name: normalizedName, // 소문자로 저장
      color: createS3ObjectTagDto.color || '#FFFFFF',
      type: createS3ObjectTagDto.type,
    });

    const savedTag = await this.s3ObjectTagRepository.save(tag);
    this.logger.log(`S3ObjectTag created successfully with id: ${savedTag.id}`);
    return savedTag;
  }

  /**
   * 모든 S3ObjectTag 조회
   */
  async findAll(): Promise<S3ObjectTag[]> {
    this.logger.log('Finding all S3ObjectTags');
    const tags = await this.s3ObjectTagRepository.find({
      relations: ['s3Objects'],
      order: {
        name: 'ASC',
      },
    });
    this.logger.log(`Found ${tags.length} S3ObjectTags`);
    return tags;
  }

  /**
   * ID로 S3ObjectTag 조회
   */
  async findOne(id: string): Promise<S3ObjectTag> {
    this.logger.log(`Finding S3ObjectTag with id: ${id}`);
    const tag = await this.s3ObjectTagRepository.findOne({
      where: { id },
      relations: ['s3Objects'],
    });

    if (!tag) {
      this.logger.warn(`S3ObjectTag not found with id: ${id}`);
      throw new NotFoundException(`S3ObjectTag with id '${id}' not found`);
    }

    this.logger.log(`Found S3ObjectTag with id: ${id}`);
    return tag;
  }

  /**
   * 이름으로 S3ObjectTag 조회
   */
  async findByName(name: string, type?: string): Promise<S3ObjectTag | null> {
    this.logger.log(`Finding S3ObjectTag with name: ${name}`);
    const normalizedName = name.toLowerCase();
    const tag = await this.s3ObjectTagRepository.findOne({
      where: { name: normalizedName, type },
    });

    if (tag) {
      this.logger.log(`Found S3ObjectTag with name: ${name}`);
    } else {
      this.logger.log(`S3ObjectTag not found with name: ${name}`);
    }

    return tag;
  }

  /**
   * 타입별 S3ObjectTag 조회
   */
  async findByType(type: string): Promise<S3ObjectTag[]> {
    this.logger.log(`Finding S3ObjectTags with type: ${type}`);
    const tags = await this.s3ObjectTagRepository.find({
      where: { type },
      order: {
        name: 'ASC',
      },
    });
    this.logger.log(`Found ${tags.length} S3ObjectTags with type: ${type}`);
    return tags;
  }

  /**
   * 여러 ID로 S3ObjectTag 조회
   */
  async findByIds(ids: string[]): Promise<S3ObjectTag[]> {
    this.logger.log(`Finding S3ObjectTags with ids: ${ids.join(', ')}`);
    const tags = await this.s3ObjectTagRepository.find({
      where: { id: In(ids) },
      relations: ['s3Objects'],
    });
    this.logger.log(`Found ${tags.length} S3ObjectTags`);
    return tags;
  }

  /**
   * S3ObjectTag 수정
   */
  async update(
    id: string,
    updateS3ObjectTagDto: UpdateS3ObjectTagDto,
  ): Promise<S3ObjectTag> {
    this.logger.log(`Updating S3ObjectTag with id: ${id}`);

    const tag = await this.findOne(id);

    // 이름 변경 시 중복 확인
    if (updateS3ObjectTagDto.name && updateS3ObjectTagDto.name !== tag.name) {
      const normalizedName = updateS3ObjectTagDto.name.toLowerCase();
      const existingTag = await this.s3ObjectTagRepository.findOne({
        where: { name: normalizedName },
      });

      if (existingTag) {
        throw new ExistingException('Tag', updateS3ObjectTagDto.name);
      }

      // 소문자로 변환하여 저장
      updateS3ObjectTagDto.name = normalizedName;
    }

    Object.assign(tag, updateS3ObjectTagDto);
    const updatedTag = await this.s3ObjectTagRepository.save(tag);
    this.logger.log(`S3ObjectTag updated successfully with id: ${id}`);
    return updatedTag;
  }

  /**
   * S3ObjectTag 삭제
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Removing S3ObjectTag with id: ${id}`);

    const tag = await this.findOne(id);

    // 연관된 S3Object가 있는지 확인
    if (tag.s3Objects && tag.s3Objects.length > 0) {
      throw new BadRequestException(
        `Cannot delete tag '${tag.name}' because it is associated with ${tag.s3Objects.length} S3Objects`,
      );
    }

    await this.s3ObjectTagRepository.remove(tag);
    this.logger.log(`S3ObjectTag removed successfully with id: ${id}`);
  }

  /**
   * 여러 S3ObjectTag 삭제
   */
  async removeMultiple(ids: string[]): Promise<void> {
    this.logger.log(
      `Removing multiple S3ObjectTags with ids: ${ids.join(', ')}`,
    );

    const tags = await this.findByIds(ids);

    // 연관된 S3Object가 있는 태그 확인
    const tagsWithObjects = tags.filter(
      (tag) => tag.s3Objects && tag.s3Objects.length > 0,
    );
    if (tagsWithObjects.length > 0) {
      const tagNames = tagsWithObjects.map((tag) => tag.name).join(', ');
      throw new BadRequestException(
        `Cannot delete tags: ${tagNames} because they are associated with S3Objects`,
      );
    }

    await this.s3ObjectTagRepository.remove(tags);
    this.logger.log(`Multiple S3ObjectTags removed successfully`);
  }

  /**
   * 사용 가능한 태그 타입 목록 조회
   */
  async getAvailableTypes(): Promise<string[]> {
    this.logger.log('Getting available tag types');
    const result = await this.s3ObjectTagRepository
      .createQueryBuilder('tag')
      .select('DISTINCT tag.type', 'type')
      .orderBy('tag.type', 'ASC')
      .getRawMany();

    const types = result.map((row) => row.type);
    this.logger.log(`Found ${types.length} available types`);
    return types;
  }

  /**
   * 태그 생성 또는 조회 (upsert)
   */
  async createOrFind(tagData: CreateS3ObjectTagDto): Promise<S3ObjectTag> {
    this.logger.log(
      `Creating or finding S3ObjectTag with name: ${tagData.name}`,
    );

    // 입력 데이터를 소문자로 변환
    const normalizedTagData = {
      ...tagData,
      name: tagData.name.toLowerCase(),
    };

    let tag = await this.findByName(normalizedTagData.name, tagData.type);

    if (!tag) {
      tag = await this.create(normalizedTagData);
    }

    return tag;
  }

  /**
   * 태그 생성 (이미 존재하면 무시)
   */
  async createOrVoid(
    tagData: CreateS3ObjectTagDto,
  ): Promise<S3ObjectTag | null> {
    this.logger.log(
      `Creating S3ObjectTag with name: ${tagData.name} (or void if exists)`,
    );

    try {
      const tag = await this.create(tagData);
      this.logger.log(`S3ObjectTag created successfully with id: ${tag.id}`);
      return tag;
    } catch (error) {
      if (error instanceof ExistingException) {
        this.logger.log(
          `S3ObjectTag '${tagData.name}' already exists, skipping creation`,
        );
        return null;
      }
      // 다른 에러는 그대로 throw
      throw error;
    }
  }
}
