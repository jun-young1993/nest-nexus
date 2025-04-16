import { Injectable } from '@nestjs/common';
import { CreateNoticeStrategyInterface } from '../strategy/create-notice/create-notice.strategy.interface';
import { CreateNoticeEvent } from '../event/create-notice.event';

@Injectable()
export class CreateNoticeService {
  private strategies: CreateNoticeStrategyInterface[] = [];

  registerStrategy(strategy: CreateNoticeStrategyInterface[]): void {
    this.strategies.push(...strategy);
  }

  async handleCreateNotice(event: CreateNoticeEvent): Promise<void> {
    const applicableStrategies = this.strategies.filter((strategy) =>
      strategy.shouldHandle(event),
    );

    await Promise.all(
      applicableStrategies.map((strategy) => strategy.handle(event)),
    );
  }
}
