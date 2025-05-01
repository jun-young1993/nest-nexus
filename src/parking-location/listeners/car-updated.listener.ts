import { Inject, Injectable } from '@nestjs/common';
import { CarUpdatedEvent } from '../events/car-updated.event';
import { EventName } from 'src/enums/event-name.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';
import { LogService } from 'src/log/log.service';
import { MyCarService } from '../my-car.service';
import { parkingLocationGroupName } from '../constance/parking-location.constance';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class CarUpdatedListener {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
    private readonly logService: LogService,
    private readonly myCarService: MyCarService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @OnEvent(EventName.CAR_UPDATED)
  async handleCarUpdated(event: CarUpdatedEvent) {
    const { currentCarNumber, previousCarNumber } = event;
    this.logger.info('[HANDLE CAR UPDATED]', currentCarNumber.id);
    const isUnparked =
      currentCarNumber.isParked === false &&
      previousCarNumber.isParked === true;
    const isParked =
      currentCarNumber.isParked === true &&
      previousCarNumber.isParked === false;
    const carFullNumber = currentCarNumber.fullNumber;
    if (isParked || isUnparked) {
      // 출차 알림
      const fcmTokens = await this.myCarService.getFcmTokens(currentCarNumber);
      const exceptedTime = previousCarNumber.expectedTime;
      let exceptedDiffMinutes = 0;
      if (exceptedTime) {
        const currentTime = new Date().getTime();
        const expectedTime = new Date(exceptedTime).getTime();
        const diffMinutes =
          Math.floor((currentTime - expectedTime) / (1000 * 60)) * -1;
        exceptedDiffMinutes = diffMinutes;
      }

      const message =
        exceptedDiffMinutes === 0
          ? `${carFullNumber} 차량이 ${isParked ? '주차' : '출차'} 되었습니다.`
          : `${carFullNumber} 차량의 예상 ${isParked ? '주차' : '출차'} 시간은 ${exceptedDiffMinutes}분 전입니다.`;

      await this.logService.createByGroupName(
        parkingLocationGroupName(currentCarNumber.parkingLocation.zoneCode),
        message,
      );
      await this.myHomeParkingFcmService.sendMessage({
        tokens: fcmTokens,
        notification: {
          title: '차량 주차 알림',
          body: message,
        },
      });
      this.logger.info('[HANDLE CAR UPDATED][SEND FCM]', message);
    }
  }
}
