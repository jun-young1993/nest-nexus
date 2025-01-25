import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import {PostTag} from "./entities/post-tag.entity";

@Injectable()
export class PostTagService {
  constructor(
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
  ) {}

  async findAll() {
    return await this.postTagRepository.find();
  }

  async getTagsWithPostCount(): Promise<{ id: string; name: string; color: string; postCount: number }[]> {
    const tags = await this.postTagRepository
        .createQueryBuilder('tag')
        .leftJoin('tag.posts', 'post')
        .select('tag.id', 'id')
        .addSelect('tag.name', 'name')
        .addSelect('tag.color', 'color')
        .addSelect('COUNT(post.id)', 'postCount') // Post 개수
        .groupBy('tag.id') // Tag별로 그룹화
        .getRawMany();

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      postCount: Number(tag.postCount),
    }));
  }

}
