import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticeGroupService } from './notice-group.service';
import { NoticeView } from './entities/notice-view.entity';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    private readonly noticeGroupService: NoticeGroupService,
    @InjectRepository(NoticeView)
    private readonly noticeViewRepository: Repository<NoticeView>,
  ) {}

  async create(createNoticeDto: CreateNoticeDto) {
    // noticeGroup 존재 여부 확인
    const noticeGroup = await this.noticeGroupService.findOne(
      createNoticeDto.noticeGroupId,
    );
    if (!noticeGroup) {
      throw new NotFoundException(
        `Notice group with ID ${createNoticeDto.noticeGroupId} not found`,
      );
    }

    const notice = this.noticeRepository.create(createNoticeDto);

    return await this.noticeRepository.save(notice);
  }

  async findByNoticeGroupId(noticeGroupId: string) {
    return await this.noticeRepository.find({
      where: { noticeGroupId },
    });
  }

  async findOneBase(options: FindOneOptions<Notice>) {
    return await this.noticeRepository.findOne(options);
  }

  async findOne(id: string) {
    return await this.findOneBase({
      where: { id },
      relations: ['noticeReplies'],
    });
  }

  async findOneByName(name: string, options?: FindManyOptions<Notice>) {
    const noticeGroup = await this.noticeGroupService.findOneByName(name);
    if (!noticeGroup) {
      throw new NotFoundException(`Notice group with name ${name} not found`);
    }
    return await this.findOneBase({
      where: { noticeGroupId: noticeGroup.id },
      ...options,
    });
  }

  async findByName(name: string, options?: FindManyOptions<Notice>) {
    const noticeGroup = await this.noticeGroupService.findOneByName(name);
    if (!noticeGroup) {
      throw new NotFoundException(`Notice group with name ${name} not found`);
    }
    return await this.noticeRepository.find({
      where: { noticeGroupId: noticeGroup.id, ...options?.where },
      skip: options?.skip || 0,
      take: options?.take || 10,
      relations: ['noticeReplies'],
      order: {
        createdAt: 'DESC',
        noticeReplies: {
          createdAt: 'DESC',
        },
      },
    });
  }

  async incrementViewCount(noticeId: string, userId?: string) {
    const notice = await this.findOne(noticeId);
    if (userId) {
      const noticeView = await this.noticeViewRepository.findOne({
        where: { noticeId, userId },
      });

      if (!noticeView) {
        const newNoticeView = this.noticeViewRepository.create({
          noticeId,
          userId,
        });
        await this.noticeViewRepository.save(newNoticeView);

        notice.viewCount++;
        await this.noticeRepository.save(notice);
      }
    }

    return notice;
  }
}
