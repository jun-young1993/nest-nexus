import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './entities/app-config.entity';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectRepository(AppConfig)
    private readonly appConfigRepository: Repository<AppConfig>,
  ) {}

  async create(createAppConfigDto: CreateAppConfigDto): Promise<AppConfig> {
    const appConfig = this.appConfigRepository.create(createAppConfigDto);
    return await this.appConfigRepository.save(appConfig);
  }

  async findAll(): Promise<AppConfig[]> {
    return await this.appConfigRepository.find();
  }

  async findOne(key: string): Promise<AppConfig> {
    const appConfig = await this.appConfigRepository.findOne({
      where: { key },
    });

    if (!appConfig) {
      throw new NotFoundException(`키가 ${key}인 설정을 찾을 수 없습니다.`);
    }

    return appConfig;
  }

  async findByVersion(version: string): Promise<AppConfig[]> {
    const appConfigs = await this.appConfigRepository.find({
      where: { version },
    });

    if (!appConfigs.length) {
      throw new NotFoundException(`버전 ${version}의 설정을 찾을 수 없습니다.`);
    }

    return appConfigs;
  }

  async update(key: string, updateAppConfigDto: UpdateAppConfigDto): Promise<AppConfig> {
    const appConfig = await this.findOne(key);
    
    Object.assign(appConfig, updateAppConfigDto);
    return await this.appConfigRepository.save(appConfig);
  }

  async remove(key: string): Promise<void> {
    const appConfig = await this.findOne(key);
    await this.appConfigRepository.remove(appConfig);
  }
} 