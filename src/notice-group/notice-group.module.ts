import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeGroupController } from './notice-group.controller';
import { NoticeGroup } from './entities/notice-group.entity';
import { NoticeGroupService } from './notice-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeGroup])],
  controllers: [NoticeGroupController],
  providers: [NoticeGroupService],
})
export class NoticeGroupModule {}
