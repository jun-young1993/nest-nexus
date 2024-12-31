import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCodeDto } from './dto/create-code.dto';
import { Code } from './entities/code.entity';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepository: Repository<Code>,
  ) {}

  async create(createCodeDto: CreateCodeDto) {
    return await this.codeRepository.save(
      this.codeRepository.create(createCodeDto),
    );
  }

  async findOne(id: number): Promise<Code> {
    const result = await this.codeRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!result) {
      throw new NotFoundException(`Code with ID ${id} not found`);
    }
    return result;
  }

  async findOneByCode(code: string): Promise<Code> {
    const result = await this.codeRepository.findOne({
      where: {
        code: code,
      },
    });
    if (!result) {
      throw new NotFoundException(`Code with CODE ${code} not found`);
    }
    return result;
  }

  async findAll(): Promise<Code[]> {
    return await this.codeRepository.find();
  }
}
