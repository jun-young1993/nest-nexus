import { CarStatusChangedEvent } from '../events/car-status-changed.event';

export interface CarNotificationStrategy {
  shouldHandle(event: CarStatusChangedEvent): boolean;
  handle(event: CarStatusChangedEvent): Promise<void>;
}
