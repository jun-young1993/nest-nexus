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
import { CarNotificationService } from './events/notification/service/car-notification.service';
import { ParkingNotificationStrategy } from './events/notification/strategy/car-changed/parking-notification.strategy';
import { UnparkingNotificationStrategy } from './events/notification/strategy/car-changed/unparking-notification.strategy';
import { CreateNoticeService } from './events/notification/service/create-notice.service';
import { CreateNoticeStrategy } from './events/notification/strategy/create-notice/create-notice.strategy';

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
    CarNotificationService,
    ParkingNotificationStrategy,
    UnparkingNotificationStrategy,
    CreateNoticeService,
    CreateNoticeStrategy,
    CreateNoticeService,
  ],
  exports: [MyCarService],
})
export class ParkingLocationModule {
  constructor(
    private readonly carNotificationService: CarNotificationService,
    private readonly parkingNotificationStrategy: ParkingNotificationStrategy,
    private readonly unparkingNotificationStrategy: UnparkingNotificationStrategy,
    private readonly createNoticeService: CreateNoticeService,
    private readonly createNoticeStrategy: CreateNoticeStrategy,
  ) {
    // 알림 전략 등록
    this.carNotificationService.registerStrategy([
      this.parkingNotificationStrategy,
      this.unparkingNotificationStrategy,
    ]);
    this.createNoticeService.registerStrategy([this.createNoticeStrategy]);
  }
}
