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
    const carNumber = await this.carNumberRepository.findOne({
      where: { id },
      relations: ['parkingLocation'],
    });

    return carNumber;
  }

  async findOneOrFail(id: string): Promise<CarNumber> {
    const carNumber = await this.findOne(id);
    if (!carNumber) {
      throw new NotFoundException('Car number not found');
    }
    return carNumber;
  }

  async update(
    id: string,
    updateCarNumberDto: UpdateCarNumberDto,
  ): Promise<CarNumber> {
    const carNumber = await this.findOneOrFail(id);
    return this.carNumberRepository.save({
      ...carNumber,
      ...updateCarNumberDto,
    });
  }

  async getFcmTokens(carNumber: CarNumber): Promise<string[]> {
    const parkingLocationId = carNumber.parkingLocationId;
    const carnumbers = await this.carNumberRepository.find({
      where: { parkingLocationId },
    });

    // FCM 토큰이 있는 차량만 필터링하고 중복 제거
    const uniqueTokens = new Set(
      carnumbers
        .filter((car) => car.fcmToken) // FCM 토큰이 있는 차량만
        .map((car) => car.fcmToken),
    );

    return Array.from(uniqueTokens);
  }
}
