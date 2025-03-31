import { Module } from '@nestjs/common';
import { ParkingLocationService } from './parking-location.service';
import { ParkingLocationController } from './parking-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocation } from './entities/parking-location.entity';
import { CarNumber } from './entities/car-number.entity';
import { MyCarController } from './my-car.controller';
import { MyCarService } from './my-car.service';
import { LogModule } from 'src/log/log.module';
import { NoticeModule } from 'src/notice/notice.module';

@Module({
  imports: [
    NoticeModule,
    LogModule,
    TypeOrmModule.forFeature([ParkingLocation, CarNumber]),
  ],
  controllers: [ParkingLocationController, MyCarController],
  providers: [ParkingLocationService, MyCarService],
})
export class ParkingLocationModule {}
