import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeReply } from '../notice/entities/notice-reply.entity';
import { Repository } from 'typeorm';
import { CreateNoticeReplyDto } from '../notice/dto/create-notice-reply.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NoticeReplyService {
  constructor(
    @InjectRepository(NoticeReply)
    private noticeReplyRepository: Repository<NoticeReply>,
    private userService: UserService,
  ) {}

  async create(createNoticeReplyDto: CreateNoticeReplyDto) {
    const user = await this.userService.findOneOrFail(
      createNoticeReplyDto.userId,
    );

    return await this.noticeReplyRepository.save(
      this.noticeReplyRepository.create({
        ...createNoticeReplyDto,
        userName: user.username,
        userId: user.id,
      }),
    );
  }

  async findAllByNoticeId(noticeId: string) {
    return await this.noticeReplyRepository.find({
      where: { noticeId },
    });
  }
}
