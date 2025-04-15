import { CarNumber } from '../entities/car-number.entity';

export enum CarStatus {
  PARKED = 'PARKED',
  UNPARKED = 'UNPARKED',
}

export class CarStatusChangedEvent {
  constructor(
    public readonly carNumber: CarNumber,
    public readonly previousStatus: boolean,
    public readonly currentStatus: boolean,
    public readonly status: CarStatus,
  ) {}
} 