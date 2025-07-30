import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeView } from './entities/notice-view.entity';
import { Repository } from 'typeorm';

export interface NoticeViewCount {
  noticeId: string;
  count: number;
}

@Injectable()
export class NoticeViewService {
  constructor(
    @InjectRepository(NoticeView)
    private readonly noticeViewRepository: Repository<NoticeView>,
  ) {}

  async findInactiveNoticeViews(): Promise<NoticeViewCount[]> {
    const result = await this.noticeViewRepository
      .createQueryBuilder('notice_view')
      .where('notice_view.isActive = :isActive', { isActive: false })
      .groupBy('notice_view.noticeId')
      .select('notice_view.noticeId', 'noticeId')
      .addSelect('COUNT(notice_view.noticeId)', 'count')
      .getRawMany();

    return result.map((row) => ({
      noticeId: row.noticeId,
      count: Number(row.count),
    }));
  }

  async updateActiveNoticeViewsByNoticeId(noticeId: string) {
    await this.noticeViewRepository.update({ noticeId }, { isActive: true });
  }
}
