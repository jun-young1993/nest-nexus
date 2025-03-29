import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LogGroup } from './entities/log-group.entity';
import { CreateLogGroupDto } from './dto/create-log-group.dto';

@Injectable()
export class LogGroupService {
  constructor(
    @InjectRepository(LogGroup)
    private logGroupRepository: Repository<LogGroup>,
  ) {}

  async create(createLogGroupDto: CreateLogGroupDto) {
    return this.logGroupRepository.save(
      this.logGroupRepository.create(createLogGroupDto),
    );
  }

  async findAll() {
    return this.logGroupRepository.find();
  }

  async findOne(id: string) {
    return this.logGroupRepository.findOne({ where: { id } });
  }

  async findOneByName(name: string) {
    return this.logGroupRepository.findOne({ where: { name } });
  }

  async findOneByNameOrFail(name: string) {
    const logGroup = await this.findOneByName(name);
    if (!logGroup) {
      throw new NotFoundException('Log group not found');
    }
    return logGroup;
  }

  async findOneByNameOrCreate(name: string) {
    const logGroup = await this.findOneByName(name);
    if (logGroup) {
      return logGroup;
    }
    return this.create({ name });
  }
}
