import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import {In, Repository} from 'typeorm';
import {PostTag} from "./entities/post-tag.entity";
import {User} from "../user/entities/user.entity";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(tagIds: string[], title: string, content: string) {
    const tags = await this.postTagRepository.find({
      where: {
        id: In(tagIds)
      }
    });
    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Some tags were not found');
    }
    const userEmail = 'juny3738@gmail.com'
    // 2. 유저 검증 및 조회
    const author = await this.userRepository.findOne({ where: { email: userEmail } });
    if (!author) {
      throw new NotFoundException(`User with ID ${userEmail} not found`);
    }

    // 새로운 Post 생성
    const post = this.postRepository.create({
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
      author
    });

    return this.postRepository.save(post);
  }

  async findAll(options: {
    limit: number; // 페이지 크기
    page: number;
    sort?: keyof Post;
    order?: 'DESC' | 'ASC';
    tagId?: string; // 태그 ID 조건
  }) {
    const {
      sort = 'createdAt', // 기본 정렬 필드
      order = 'DESC', // 기본 정렬 방향
      page = 1, // 기본 페이지 번호
      limit = 10, // 기본 페이지 크기
      tagId, // 태그 ID 조건
    } = options;

    // 페이징 계산
    const skip = (page - 1) * limit;

    // QueryBuilder를 사용해 데이터 조회
    const query = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.tags', 'tag') // 태그 관계 조인
        .orderBy(`post.${sort}`, order) // 동적 정렬
        .skip(skip) // 시작 지점
        .take(limit); // 페이지 크기

    // 태그 ID 조건이 있으면 where 추가
    if (tagId) {
      query.andWhere('tag.id = :tagId', { tagId });
    }

    // 데이터 및 총 개수 조회
    const [data, total] = await query.getManyAndCount();

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
    return this.postRepository.findOne({
      relations:['tags'],
      where: { id: id }
    });
  }
}
