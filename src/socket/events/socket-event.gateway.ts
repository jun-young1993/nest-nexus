import { Inject } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
})
export class SocketEventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ClientToServer')
  async handleMessage(@MessageBody() data) {
    this.server.emit('ServerToClient', data);
  }

  afterInit() {
    this.logger.info('웹소켓 서버 초기화 ✅');
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client Disconnected : ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.info(`Client Connected : ${client.id}`, args);
  }
}
