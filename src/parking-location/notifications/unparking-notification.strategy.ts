import { Injectable } from '@nestjs/common';
import { CarNotificationStrategy } from './car-notification.strategy';
import {
  CarStatusChangedEvent,
  CarStatus,
} from '../events/car-status-changed.event';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';
import { MyCarService } from '../my-car.service';
import { LogService } from 'src/log/log.service';
import { parkingLocationGroupName } from '../constance/parking-location.constance';

@Injectable()
export class UnparkingNotificationStrategy implements CarNotificationStrategy {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
    private readonly myCarService: MyCarService,
    private readonly logService: LogService,
  ) {}

  shouldHandle(event: CarStatusChangedEvent): boolean {
    return event.status === CarStatus.UNPARKED;
  }

  async handle(event: CarStatusChangedEvent): Promise<void> {
    const { carNumber } = event;
    const fcmTokens = await this.myCarService.getFcmTokens(carNumber);
    const carFullNumber = `${carNumber.region} ${carNumber.category} ${carNumber.number}`;
    const message = `${carFullNumber} 차량이 출차 되었습니다.`;

    // 로그 기록
    await this.logService.createByGroupName(
      parkingLocationGroupName(carNumber.parkingLocation.zoneCode),
      message,
    );

    // FCM 알림 전송
    await this.myHomeParkingFcmService.sendMessage({
      tokens: fcmTokens,
      notification: {
        title: '차량 출차 알림',
        body: message,
      },
    });
  }
}
