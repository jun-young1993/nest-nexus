import { Injectable, NotFoundException } from '@nestjs/common';
import { CarNumber } from './entities/car-number.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';

@Injectable()
export class MyCarService {
  constructor(
    @InjectRepository(CarNumber)
    private carNumberRepository: Repository<CarNumber>,
  ) {}

  async findAll(): Promise<CarNumber[]> {
    return this.carNumberRepository.find();
  }

  async findOne(id: string): Promise<CarNumber> {
    const carNumber = await this.carNumberRepository.findOne({ where: { id } });
    if (!carNumber) {
      throw new NotFoundException('Car number not found');
    }
    return carNumber;
  }

  async update(
    id: string,
    updateCarNumberDto: UpdateCarNumberDto,
  ): Promise<CarNumber> {
    const carNumber = await this.carNumberRepository.findOne({ where: { id } });
    if (!carNumber) {
      throw new NotFoundException('Car number not found');
    }
    return this.carNumberRepository.save({
      ...carNumber,
      ...updateCarNumberDto,
    });
  }
}
