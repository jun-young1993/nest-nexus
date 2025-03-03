import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { ParkingLocation } from './entities/parking-location.entity';

@Injectable()
export class ParkingLocationService {
  constructor(
    @InjectRepository(ParkingLocation)
    private parkingLocationRepository: Repository<ParkingLocation>,
  ) {}

  async create(
    createParkingLocationDto: CreateParkingLocationDto,
  ): Promise<ParkingLocation> {
    const parkingLocation = this.parkingLocationRepository.create(
      createParkingLocationDto,
    );
    return await this.parkingLocationRepository.save(parkingLocation);
  }

  async findOne(id: string): Promise<ParkingLocation> {
    const parkingLocation = await this.parkingLocationRepository.findOne({
      where: { id },
      relations: ['threeObjects'], // Three.js 객체 정보도 함께 조회
    });

    if (!parkingLocation) {
      throw new NotFoundException(`Parking location with ID ${id} not found`);
    }

    return parkingLocation;
  }

  // update(id: number, updateParkingLocationDto: UpdateParkingLocationDto) {
  //   return `This action updates a #${id} parkingLocation`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} parkingLocation`;
  // }
}
