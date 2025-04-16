import { Injectable } from '@nestjs/common';
import { NoticeType } from 'src/notice/enum/notice.type';
import { CreateNoticeEvent } from '../../event/create-notice.event';
import { CreateNoticeStrategyInterface } from './create-notice.strategy.interface';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';
import { ParkingLocationService } from 'src/parking-location/parking-location.service';

@Injectable()
export class CreateNoticeStrategy implements CreateNoticeStrategyInterface {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
    private readonly parkingLocationService: ParkingLocationService,
  ) {}
  shouldHandle(event: CreateNoticeEvent): boolean {
    return event.notice.type === NoticeType.NOTICE;
  }

  async handle(event: CreateNoticeEvent): Promise<void> {
    const { notice, zoneCode } = event;
    const parkingLocation =
      await this.parkingLocationService.findByZoneCode(zoneCode);
    const fcmTokens = parkingLocation.carNumbers.map(
      (carNumber) => carNumber.fcmToken,
    );
    await this.myHomeParkingFcmService.sendMessage({
      tokens: fcmTokens,
      notification: {
        title: notice.title,
        body:
          notice.content.length > 7
            ? `${notice.content.substring(0, 7)}...`
            : notice.content,
      },
    });
  }
}
