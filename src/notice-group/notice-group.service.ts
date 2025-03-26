import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeGroup } from './entities/notice-group.entity';
import { Repository } from 'typeorm';
import { CreateNoticeGroupDto } from './dto/create-notice-group.dto';

@Injectable()
export class NoticeGroupService {
  constructor(
    @InjectRepository(NoticeGroup)
    private readonly noticeGroupRepository: Repository<NoticeGroup>,
  ) {}

  async create(createNoticeGroupDto: CreateNoticeGroupDto) {
    return await this.noticeGroupRepository.save(
      this.noticeGroupRepository.create(createNoticeGroupDto),
    );
  }
}
