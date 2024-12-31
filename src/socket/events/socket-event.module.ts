import { Module } from '@nestjs/common';
import { SocketEventsGateway } from './socket-event.gateway';

@Module({
  providers: [SocketEventsGateway],
})
export class SocketEventModule {}
