import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { ParkingLocation } from './entities/parking-location.entity';
import { CarNumber } from './entities/car-number.entity';

@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation)
    private parkingLocationRepository: Repository<ParkingLocation>,
    @InjectRepository(CarNumber)
    private carNumberRepository: Repository<CarNumber>,
  ) {}

  async create(
    createParkingLocationDto: CreateParkingLocationDto,
  ): Promise<CarNumber> {
    const { carNumber: carNumberDto, ...parkingLocationData } =
      createParkingLocationDto;

    // 주차 위치 생성
    const parkingLocation =
      (await this.findByZoneCode(parkingLocationData.zoneCode)) ||
      (await this.parkingLocationRepository.save(
        this.parkingLocationRepository.create(parkingLocationData),
      ));

    // 차량 번호가 있는 경우 생성
    if (carNumberDto) {
      const carNumber = await this.carNumberRepository.create({
        ...carNumberDto,
        parkingLocationId: parkingLocation.id,
      });
      return await this.carNumberRepository.save(carNumber);
    }

    throw new NotFoundException('Car number not found');
  }

  async findOne(id: string): Promise<ParkingLocation> {
    const parkingLocation = await this.parkingLocationRepository.findOne({
      where: { id },
      relations: ['carNumbers', 'threeObjects'],
    });

    if (!parkingLocation) {
      throw new NotFoundException(`Parking location with ID ${id} not found`);
    }

    return parkingLocation;
  }

  async findByZoneCode(zoneCode: string): Promise<ParkingLocation> {
    const parkingLocations = await this.parkingLocationRepository.findOne({
      where: {
        zoneCode: zoneCode, // zoneCode가 주소에 포함된 경우 검색
      },
      relations: ['carNumbers', 'threeObjects'],
    });

    return parkingLocations;
  }

  // update(id: number, updateParkingLocationDto: UpdateParkingLocationDto) {
  //   return `This action updates a #${id} parkingLocation`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} parkingLocation`;
  // }
}
