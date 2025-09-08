import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Sequence } from './entities/sequence.entity';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { SequenceName } from './sequence.constance';

@Injectable()
export class SequenceService {
  private readonly logger = new Logger(SequenceService.name);

  constructor(
    @InjectRepository(Sequence)
    private readonly sequenceRepository: Repository<Sequence>,
  ) {}

  /**
   * 시퀀스 생성
   */
  async createSequence(
    createSequenceDto: CreateSequenceDto,
  ): Promise<Sequence> {
    const { sequenceName, sequenceNumber = 0, ...rest } = createSequenceDto;

    // 시퀀스명 중복 확인
    const existingSequence = await this.sequenceRepository.findOne({
      where: { sequenceName },
    });

    if (existingSequence) {
      throw new BadRequestException(
        `시퀀스명 '${sequenceName}'이 이미 존재합니다.`,
      );
    }

    const sequence = this.sequenceRepository.create({
      sequenceName,
      sequenceNumber,
      ...rest,
    });

    const savedSequence = await this.sequenceRepository.save(sequence);
    this.logger.log(`시퀀스 생성: ${sequenceName}`);

    return savedSequence;
  }

  /**
   * 시퀀스 목록 조회
   */
  async getSequences(
    options?: FindManyOptions<Sequence>,
    optionsWhere?: FindOptionsWhere<Sequence>,
  ): Promise<Sequence[]> {
    const where: FindOptionsWhere<Sequence> = {
      ...optionsWhere,
    };

    return this.sequenceRepository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options,
    });
  }

  /**
   * 특정 시퀀스 조회
   */
  async getSequence(id: string): Promise<Sequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id },
    });

    if (!sequence) {
      throw new NotFoundException(`시퀀스를 찾을 수 없습니다. ID: ${id}`);
    }

    return sequence;
  }

  /**
   * 시퀀스명으로 시퀀스 조회
   */
  async getSequenceByName(sequenceName: string): Promise<Sequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { sequenceName },
    });

    if (!sequence) {
      throw new NotFoundException(
        `시퀀스를 찾을 수 없습니다. 이름: ${sequenceName}`,
      );
    }

    return sequence;
  }

  /**
   * 시퀀스 수정
   */
  async updateSequence(
    id: string,
    updateSequenceDto: UpdateSequenceDto,
  ): Promise<Sequence> {
    const sequence = await this.getSequence(id);

    // 시퀀스명 변경 시 중복 확인
    if (
      updateSequenceDto.sequenceName &&
      updateSequenceDto.sequenceName !== sequence.sequenceName
    ) {
      const existingSequence = await this.sequenceRepository.findOne({
        where: { sequenceName: updateSequenceDto.sequenceName },
      });

      if (existingSequence) {
        throw new BadRequestException(
          `시퀀스명 '${updateSequenceDto.sequenceName}'이 이미 존재합니다.`,
        );
      }
    }

    Object.assign(sequence, updateSequenceDto);
    const updatedSequence = await this.sequenceRepository.save(sequence);
    this.logger.log(`시퀀스 수정: ${sequence.sequenceName}`);

    return updatedSequence;
  }

  /**
   * 시퀀스 삭제
   */
  async removeSequence(id: string): Promise<void> {
    const sequence = await this.getSequence(id);
    await this.sequenceRepository.remove(sequence);
    this.logger.log(`시퀀스 삭제: ${sequence.sequenceName}`);
  }

  /**
   * 다음 시퀀스 번호 생성
   */
  async generateNextSequence(sequenceName: SequenceName): Promise<string> {
    const sequence = await this.getSequenceByName(sequenceName);

    if (!sequence.isActive) {
      throw new BadRequestException(
        `시퀀스 '${sequenceName}'이 비활성화되어 있습니다.`,
      );
    }

    // 시퀀스 번호 증가
    sequence.sequenceNumber = Number(sequence.sequenceNumber) + 1;
    await this.sequenceRepository.save(sequence);

    // 포맷된 시퀀스 번호 생성
    const formattedNumber = this.formatSequenceNumber(
      sequence.sequenceNumber,
      sequence.paddingLength,
    );

    const result = `${sequence.prefix || ''}${formattedNumber}${sequence.suffix || ''}`;
    this.logger.log(`시퀀스 생성: ${sequenceName} -> ${result}`);

    return result;
  }

  /**
   * 여러 개의 시퀀스 번호 생성
   */
  async generateMultipleSequences(
    generateSequenceDto: GenerateSequenceDto,
  ): Promise<string[]> {
    const { sequenceName, count = 1 } = generateSequenceDto;
    const sequence = await this.getSequenceByName(sequenceName);

    if (!sequence.isActive) {
      throw new BadRequestException(
        `시퀀스 '${sequenceName}'이 비활성화되어 있습니다.`,
      );
    }

    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      sequence.sequenceNumber += 1;
      const formattedNumber = this.formatSequenceNumber(
        sequence.sequenceNumber,
        sequence.paddingLength,
      );
      const result = `${sequence.prefix || ''}${formattedNumber}${sequence.suffix || ''}`;
      results.push(result);
    }

    await this.sequenceRepository.save(sequence);
    this.logger.log(`시퀀스 ${count}개 생성: ${sequenceName}`);

    return results;
  }

  /**
   * 시퀀스 번호 포맷팅
   */
  private formatSequenceNumber(number: number, paddingLength?: number): string {
    if (!paddingLength) {
      return number.toString();
    }

    return number.toString().padStart(paddingLength, '0');
  }

  /**
   * 시퀀스 리셋
   */
  async resetSequence(id: string, newNumber: number = 0): Promise<Sequence> {
    const sequence = await this.getSequence(id);
    sequence.sequenceNumber = newNumber;
    const updatedSequence = await this.sequenceRepository.save(sequence);
    this.logger.log(`시퀀스 리셋: ${sequence.sequenceName} -> ${newNumber}`);

    return updatedSequence;
  }

  /**
   * 시퀀스 활성화/비활성화
   */
  async toggleSequenceStatus(id: string): Promise<Sequence> {
    const sequence = await this.getSequence(id);
    sequence.isActive = !sequence.isActive;
    const updatedSequence = await this.sequenceRepository.save(sequence);
    this.logger.log(
      `시퀀스 상태 변경: ${sequence.sequenceName} -> ${sequence.isActive ? '활성화' : '비활성화'}`,
    );

    return updatedSequence;
  }

  /**
   * 시퀀스 통계 조회
   */
  async getSequenceStats(): Promise<{
    totalSequences: number;
    activeSequences: number;
    inactiveSequences: number;
  }> {
    const [totalSequences, activeSequences, inactiveSequences] =
      await Promise.all([
        this.sequenceRepository.count(),
        this.sequenceRepository.count({ where: { isActive: true } }),
        this.sequenceRepository.count({ where: { isActive: false } }),
      ]);

    return {
      totalSequences,
      activeSequences,
      inactiveSequences,
    };
  }
}
