import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { lastValueFrom } from 'rxjs';
import { DetailCommit } from './github.models';

@Injectable()
export class GithubCommitService {
  private githubApiUrl = 'https://api.github.com';
  private githubApiVersion = '2022-11-28';
  private githubOwner = 'jun-young1993';
  private githubEmail = 'juny3738@gmail.com';
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}
  /**
   * Fetch the latest commit for a repository and path
   */
  async getCommits(repository: string, path: string = '') {
    const url = `${this.githubApiUrl}/repos/${this.githubOwner}/${repository}/commits`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.configService.get('github.access_token', { infer: true })}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': this.githubApiVersion,
          },
          params: {
            path, // Specify the path to narrow down commits to a specific file or directory
            per_page: 1, // Only fetch the latest commit
          },
        }),
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching latest commit:', error);
      throw new Error('Failed to fetch latest commit');
    }
  }

  /**
   * Fetch details of a single commit
   */
  async getCommitDetails(
    repository: string,
    sha: string,
  ): Promise<DetailCommit> {
    const url = `${this.githubApiUrl}/repos/${this.githubOwner}/${repository}/commits/${sha}`;

    const response = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${this.configService.get('github.access_token', { infer: true })}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': this.githubApiVersion,
        },
      }),
    );

    return response.data;
  }
}
