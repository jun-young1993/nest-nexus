import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { LogGroupService } from 'src/log/log-group.service';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private parkingLogRepository: Repository<Log>,
    private logGroupService: LogGroupService,
  ) {}

  async create(createLogDto: CreateLogDto) {
    const log = this.parkingLogRepository.create(createLogDto);
    return this.parkingLogRepository.save(log);
  }

  async findAllByGroupId(groupId: string) {
    return this.parkingLogRepository.find({ where: { logGroupId: groupId } });
  }

  async createByGroupName(groupName: string, description: string) {
    const group = await this.logGroupService.findOneByNameOrFail(groupName);
    return this.create({
      description,
      logGroupId: group.id,
    });
  }
}
