import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { lastValueFrom } from 'rxjs';
import { GithubCommitService } from './github-commit.service';
import { Repository } from 'typeorm';
import { GithubContent } from './entities/github-content.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GithubContentService {
  private githubApiUrl = 'https://api.github.com';
  private githubApiVersion = '2022-11-28';
  private githubOwner = 'jun-young1993';
  private githubEmail = 'juny3738@gmail.com';
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(GithubContent)
    private readonly githubContentRepository: Repository<GithubContent>,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly githubCommitService: GithubCommitService,
  ) {}

  async createContent(repository: string, path: string, content: string) {
    const url = `${this.githubApiUrl}/repos/${this.githubOwner}/${repository}/contents/${path}`;

    const data = {
      message: `create or update cache file ${new Date().toTimeString()}`,
      content: Buffer.from(content).toString('base64'),
      author: {
        name: this.githubOwner,
        email: this.githubEmail,
      },
      committer: {
        name: this.githubOwner,
        email: this.githubEmail,
      },
    };
    const response = await lastValueFrom(
      this.httpService.put(url, data, {
        headers: {
          Authorization: `Bearer ${this.configService.get('github.access_token', { infer: true })}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': this.githubApiVersion,
        },
      }),
    );
    return response.data;
  }

  async getContents(
    repository: string,
    isDir?: 'dir' | 'file',
    path: string = '',
  ) {
    const url = `${this.githubApiUrl}/repos/${this.githubOwner}/${repository}/contents/${path}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.configService.get('github.access_token', { infer: true })}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': this.githubApiVersion,
          },
        }),
      );

      // 필터링하여 디렉토리만 반환
      const data = response.data;
      const filteredData =
        isDir && Array.isArray(data)
          ? data.filter((item: any) => item.type === isDir) // 'dir' 또는 'file' 필터
          : data; // 전체 조회 시 필터 없이 데이터 그대로 사용

      return filteredData;
    } catch (error) {
      console.error('Error fetching directories:', error);
      throw new Error(
        `[Failed to fetch contents] repository:${repository} isDir:${isDir} path:${path}`,
      );
    }
  }

  async store(repository: string, prefix: string = '') {
    const files = await this.getContents(repository, undefined, prefix);
    for (const file of files) {
      if (file.type === 'file') {
        const contentResponse = await this.getContents(
          repository,
          undefined,
          file.path,
        );
        const commits = await this.githubCommitService.getCommits(
          repository,
          file.path,
        );
        const createdAt = new Date(
          commits[commits.length - 1].commit.committer.date,
        );
        const updatedAt = new Date(
          commits[commits.length - 1].commit.author.date,
        );
        const content = Buffer.from(contentResponse.content, 'base64').toString(
          'utf8',
        );
        const githubContent = this.githubContentRepository.create({
          sha: file.sha,
          repository,
          filename: file.name,
          content,
          path: file.path,
          createdAt,
          updatedAt,
        });

        await this.githubContentRepository.save(githubContent);
      } else {
        await this.store(repository, file.path);
      }
    }
  }

  async findAll(options: {
    sortField?: keyof GithubContent; // 정렬 필드
    sortOrder?: 'ASC' | 'DESC'; // 오름/내림차순
    contentLike?: string; // 콘텐츠 검색
    limit?: number;
    page?: number;
  }) {
    const {
      sortField = 'updatedAt', // 기본 정렬 필드: createdAt
      sortOrder = 'DESC', // 기본 정렬 방향: ASC
      contentLike = '', // 기본 콘텐츠 검색: 빈 문자열
      limit = 10, // 기본 최대 개수: 10
      page = 1,
    } = options;
    // Query Builder를 사용한 조회
    const queryBuilder =
      this.githubContentRepository.createQueryBuilder('content');

    // 콘텐츠 필드에 대한 검색 조건 추가 (LIKE 검색)
    if (contentLike) {
      queryBuilder.andWhere('content.content LIKE :contentLike', {
        contentLike: `%${contentLike}%`,
      });
    }

    // 정렬 옵션 추가

    queryBuilder.orderBy(`content.${sortField}`, sortOrder);

    // 최대 개수 제한
    queryBuilder.limit(limit);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 최종 쿼리 실행 및 결과 반환
    const [results, total] = await queryBuilder.getManyAndCount();

    // 페이징 결과 반환
    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneById(id: string): Promise<GithubContent | null> {
    return this.githubContentRepository.findOne({
      where: { sha: id },
    });
  }
}
