import { Notice } from 'src/notice/entities/notice.entity';
import { ParkingLocation } from '../entities/parking-location.entity';

export class ParkingLocationNoticeCreatedEvent {
  constructor(
    public readonly parkingLocation: ParkingLocation,
    public readonly notice: Notice,
  ) {}
}
