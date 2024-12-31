import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CodeItem } from './entities/code-item.entity';
import { Repository } from 'typeorm';
import { CreateCodeItemDto } from './dto/create-code-item.dto';
import { Code } from '../code/entities/code.entity';
import { CodeService } from 'src/code/code.service';

@Injectable()
export class CodeItemService {
  constructor(
    @InjectRepository(CodeItem)
    private readonly codeItemRepository: Repository<CodeItem>,
    private readonly codeService: CodeService,
  ) {}

  async create(createCodeItemDto: CreateCodeItemDto): Promise<CodeItem> {
    const code = await this.codeService.findOne(createCodeItemDto.code_id);
    const result = await this.codeItemRepository.save(
      this.codeItemRepository.create({
        ...createCodeItemDto,
        code,
      }),
    );
    return result;
  }

  async findOneByCodeAndKey(code: string, key: string): Promise<CodeItem> {
    // 먼저 Code를 조회합니다.
    const codeEntity = await this.codeService.findOneByCode(code);

    // CodeItem을 조회합니다.
    const codeItem = await this.codeItemRepository.findOne({
      where: {
        code: codeEntity,
        key: key,
      },
    });

    if (!codeItem) {
      throw new NotFoundException(
        `CodeItem with key ${key} not found for code ${code}`,
      );
    }

    return codeItem;
  }
}
