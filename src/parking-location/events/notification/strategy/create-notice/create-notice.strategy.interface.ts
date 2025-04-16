import { CreateNoticeEvent } from '../../event/create-notice.event';

export interface CreateNoticeStrategyInterface {
  shouldHandle(event: CreateNoticeEvent): boolean;
  handle(event: CreateNoticeEvent): Promise<void>;
}
