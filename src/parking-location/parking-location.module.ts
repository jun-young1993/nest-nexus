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
import { FirebaseModule } from 'src/firebase/firebase.module';
import { CarUpdatedListener } from './listeners/car-updated.listener';
import { ParkingLocationNoticeCreatedListener } from './listeners/parking-location-notice-created.listener';

@Module({
  imports: [
    NoticeModule,
    LogModule,
    FirebaseModule,
    TypeOrmModule.forFeature([ParkingLocation, CarNumber]),
  ],
  controllers: [ParkingLocationController, MyCarController],
  providers: [
    ParkingLocationService,
    MyCarService,
    CarUpdatedListener,
    ParkingLocationNoticeCreatedListener,
  ],
  exports: [MyCarService],
})
export class ParkingLocationModule {
  constructor() {}
}
