import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GithubContentService {
  private githubApiUrl = 'https://api.github.com';
  private githubApiVersion = '2022-11-28';
  private githubOwner = 'jun-young1993';
  private githubEmail = 'juny3738@gmail.com';
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
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
}
