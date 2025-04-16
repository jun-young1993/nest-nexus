import { Notice } from 'src/notice/entities/notice.entity';
import { ParkingLocation } from 'src/parking-location/entities/parking-location.entity';

export class CreateNoticeEvent {
  constructor(
    public readonly notice: Notice,
    public readonly zoneCode: ParkingLocation['zoneCode'],
  ) {}
}
