import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GithubRepositoryService {
  private githubApiUrl = 'https://api.github.com';
  private githubApiVersion = '2022-11-28';
  private githubOwner = 'jun-young1993';
  private githubEmail = 'juny3738@gmail.com';
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}
}
