import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeItem } from './entities/code-item.entity';
import { CodeItemService } from './code-item.service';
import { Code } from '../code/entities/code.entity';
import { CodeItemController } from './code-item.controller';
import { CodeModule } from 'src/code/code.module';

@Module({
  imports: [TypeOrmModule.forFeature([CodeItem]), CodeModule],
  controllers: [CodeItemController],
  providers: [CodeItemService],
  exports: [CodeItemService],
})
export class CodeItemModule {}
