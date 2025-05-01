import { Injectable, NotFoundException } from '@nestjs/common';
import { CarNumber } from './entities/car-number.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Not, Repository, And } from 'typeorm';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { CarUpdatedEvent } from './events/car-updated.event';

@Injectable()
export class MyCarService {
  constructor(
    @InjectRepository(CarNumber)
    private carNumberRepository: Repository<CarNumber>,
    private eventEmitter: EventEmitter2,
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
    const updatedCarNumber = await this.carNumberRepository.save({
      ...carNumber,
      ...updateCarNumberDto,
    });

    this.eventEmitter.emit(
      EventName.CAR_UPDATED,
      new CarUpdatedEvent(carNumber, updatedCarNumber),
    );
    return updatedCarNumber;
  }

  async getFcmTokens(carNumber: CarNumber): Promise<string[]> {
    const parkingLocationId = carNumber.parkingLocationId;
    const carnumbers = await this.carNumberRepository.find({
      where: { parkingLocationId, allowFcmNotification: true },
    });

    // FCM 토큰이 있는 차량만 필터링하고 중복 제거
    const uniqueTokens = new Set(
      carnumbers
        .filter((car) => car.fcmToken) // FCM 토큰이 있는 차량만
        .map((car) => car.fcmToken),
    );

    return Array.from(uniqueTokens);
  }

  async findCarNumbersWithExpiredTime(
    minutesBeforeExpiration: number = 5,
  ): Promise<CarNumber[]> {
    const now = new Date();
    const oneMinuteLater = new Date(
      now.getTime() + minutesBeforeExpiration * 60 * 1000,
    );

    const carNumbers = await this.carNumberRepository.find({
      where: {
        expectedTime: And(LessThanOrEqual(oneMinuteLater), Not(IsNull())),
      },
    });

    return carNumbers;
  }
}
