import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(options: {
    limit: number; // 페이지 크기
    page: number;
    sort?: keyof Post;
    order?: 'DESC' | 'ASC';
  }) {
    const {
      sort = 'createdAt', // 기본 정렬 필드
      order = 'DESC', // 기본 정렬 방향
      page = 1, // 기본 페이지 번호
      limit = 10, // 기본 페이지 크기
    } = options;

    // 페이징 계산
    const skip = (page - 1) * limit;

    // `findAndCount`를 사용한 데이터 조회 및 총 개수 계산
    const [data, total] = await this.postRepository.findAndCount({
      order: {
        [sort]: order,
      }, // 동적 정렬
      skip, // 시작 지점
      take: limit, // 페이지 크기
    });

    return {
      data,
      pagination: {
        total, // 전체 데이터 개수
        page, // 현재 페이지 번호
        limit, // 페이지 크기
        totalPages: Math.ceil(total / limit), // 총 페이지 수
      },
    };
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postRepository.findOne({ where: { id: id } });
  }
}
