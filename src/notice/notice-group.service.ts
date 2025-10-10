import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string) {
    return await this.noticeGroupRepository.findOne({
      where: { id },
    });
  }

  async findOneByName(name: string, relations?: string[]) {
    return await this.noticeGroupRepository.findOne({
      where: { name },
      relations: relations || ['notices'],
    });
  }

  async findOneByNameOrCreate(name: string) {
    return (await this.findOneByName(name)) || (await this.create({ name }));
  }

  async findOneByNameOrCreateOrThrow(name: string) {
    const noticeGroup = await this.findOneByName(name);
    if (!noticeGroup) {
      throw new NotFoundException('공지사항 그룹 생성에 실패했습니다.');
    }
    return noticeGroup;
  }
}
