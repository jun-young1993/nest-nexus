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
import { CarNotificationService } from './notifications/car-notification.service';
import { ParkingNotificationStrategy } from './notifications/parking-notification.strategy';
import { UnparkingNotificationStrategy } from './notifications/unparking-notification.strategy';

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
  ],
  exports: [MyCarService],
})
export class ParkingLocationModule {
  constructor(
    private readonly carNotificationService: CarNotificationService,
    private readonly parkingNotificationStrategy: ParkingNotificationStrategy,
    private readonly unparkingNotificationStrategy: UnparkingNotificationStrategy,
  ) {
    // 알림 전략 등록
    this.carNotificationService.registerStrategy(
      this.parkingNotificationStrategy,
    );
    this.carNotificationService.registerStrategy(
      this.unparkingNotificationStrategy,
    );
  }
}
