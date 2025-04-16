import { Injectable } from '@nestjs/common';
import { CarNotificationStrategy } from './car-notification.strategy';
import {
  CarStatusChangedEvent,
  CarStatus,
} from '../../event/car-status-changed.event';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';
import { MyCarService } from 'src/parking-location/my-car.service';
import { LogService } from 'src/log/log.service';
import { parkingLocationGroupName } from 'src/parking-location/constance/parking-location.constance';

@Injectable()
export class ParkingNotificationStrategy implements CarNotificationStrategy {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
    private readonly myCarService: MyCarService,
    private readonly logService: LogService,
  ) {}

  shouldHandle(event: CarStatusChangedEvent): boolean {
    return event.status === CarStatus.PARKED;
  }

  async handle(event: CarStatusChangedEvent): Promise<void> {
    const { carNumber } = event;
    const fcmTokens = await this.myCarService.getFcmTokens(carNumber);
    const carFullNumber = `${carNumber.region} ${carNumber.category} ${carNumber.number}`;
    const message = `${carFullNumber} 차량이 주차 되었습니다.`;

    // 로그 기록
    await this.logService.createByGroupName(
      parkingLocationGroupName(carNumber.parkingLocation.zoneCode),
      message,
    );

    // FCM 알림 전송
    await this.myHomeParkingFcmService.sendMessage({
      tokens: fcmTokens,
      notification: {
        title: '차량 주차 알림',
        body: message,
      },
    });
  }
}
