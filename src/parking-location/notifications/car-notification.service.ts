import { Injectable } from '@nestjs/common';
import { CarNotificationStrategy } from './car-notification.strategy';
import { CarStatusChangedEvent } from '../events/car-status-changed.event';

@Injectable()
export class CarNotificationService {
  private strategies: CarNotificationStrategy[] = [];

  registerStrategy(strategy: CarNotificationStrategy): void {
    this.strategies.push(strategy);
  }

  async handleStatusChange(event: CarStatusChangedEvent): Promise<void> {
    const applicableStrategies = this.strategies.filter((strategy) =>
      strategy.shouldHandle(event),
    );

    await Promise.all(
      applicableStrategies.map((strategy) => strategy.handle(event)),
    );
  }
}
