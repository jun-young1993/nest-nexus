import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private parkingLogRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto) {
    const log = this.parkingLogRepository.create(createLogDto);
    return this.parkingLogRepository.save(log);
  }

  async findAllByGroupId(groupId: string) {
    return this.parkingLogRepository.find({ where: { logGroupId: groupId } });
  }
}
