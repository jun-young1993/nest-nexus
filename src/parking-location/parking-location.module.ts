import { Module } from '@nestjs/common';
import { ParkingLocationService } from './parking-location.service';
import { ParkingLocationController } from './parking-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocation } from './entities/parking-location.entity';
import { CarNumber } from './entities/car-number.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, CarNumber])],
  controllers: [ParkingLocationController],
  providers: [ParkingLocationService],
})
export class ParkingLocationModule {}
