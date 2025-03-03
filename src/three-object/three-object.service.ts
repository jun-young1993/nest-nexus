import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThreeObject } from './entities/three-object.entity';
import {
  CreateThreeObjectDto,
  UpdateThreeObjectsDto,
} from './dto/create-three-object.dto';
import { ThreeObjectMapper } from './utils/three-object.mapper';
import { ParkingLocation } from 'src/parking-location/entities/parking-location.entity';

@Injectable()
export class ThreeObjectService {
  constructor(
    @InjectRepository(ThreeObject)
    private threeObjectRepository: Repository<ThreeObject>,
    @InjectRepository(ParkingLocation)
    private parkingLocationRepository: Repository<ParkingLocation>,
  ) {}

  async create(
    createThreeObjectDto: CreateThreeObjectDto,
  ): Promise<ThreeObject> {
    const threeObject = this.threeObjectRepository.create(
      ThreeObjectMapper.toEntity(createThreeObjectDto),
    );

    return await this.threeObjectRepository.save(threeObject);
  }

  async findAll(): Promise<ThreeObject[]> {
    return await this.threeObjectRepository.find();
  }

  async findOne(id: string): Promise<ThreeObject> {
    return await this.threeObjectRepository.findOne({ where: { id } });
  }

  async updateObjects(
    updateDto: UpdateThreeObjectsDto,
  ): Promise<ThreeObject[]> {
    const results = await Promise.all(
      updateDto.objects.map(async (obj) => {
        // 주차 위치 확인
        const parkingLocation = await this.parkingLocationRepository.findOne({
          where: { id: obj.parkingLocationId },
        });

        if (!parkingLocation) {
          throw new NotFoundException(
            `Parking location with ID ${obj.parkingLocationId} not found`,
          );
        }

        const existingObject = await this.threeObjectRepository.findOne({
          where: { id: obj.id },
        });

        if (existingObject) {
          // 기존 객체 업데이트
          const updatedEntity = this.threeObjectRepository.merge(
            existingObject,
            ThreeObjectMapper.toEntity(obj),
          );
          return await this.threeObjectRepository.save(updatedEntity);
        } else {
          // 새 객체 생성
          const newEntity = this.threeObjectRepository.create({
            ...ThreeObjectMapper.toEntity(obj),
            parkingLocation,
          });
          return await this.threeObjectRepository.save(newEntity);
        }
      }),
    );

    return results;
  }
}
