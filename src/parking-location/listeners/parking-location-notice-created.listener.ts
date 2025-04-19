import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { ParkingLocationNoticeCreatedEvent } from '../events/parking-location-notice-created.event';
import { NoticeType } from 'src/notice/enum/notice.type';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';

@Injectable()
export class ParkingLocationNoticeCreatedListener {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
  ) {}

  @OnEvent(EventName.PARKING_LOCATION_NOTICE_CREATED)
  async handleParkingLocationNoticeCreated(
    event: ParkingLocationNoticeCreatedEvent,
  ) {
    const { parkingLocation, notice } = event;
    const isNotice = notice.type === NoticeType.NOTICE;
    if (isNotice) {
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
}
