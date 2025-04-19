import { CarNumber } from '../entities/car-number.entity';

export class CarUpdatedEvent {
  constructor(
    public readonly previousCarNumber: CarNumber,
    public readonly currentCarNumber: CarNumber,
  ) {}
}
