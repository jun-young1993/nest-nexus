import { Controller, Get } from '@nestjs/common';
import { MyHomeParkingFcmService } from './my-home-parking-fcm.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('firebase')
@Controller('firebase/fcm/my-home-parking-fcm')
export class MyHomeParkingFcmController {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
  ) {}

  @Get('send-message')
  @ApiOperation({ summary: 'send-message' })
  async sendMessage() {
    return this.myHomeParkingFcmService.sendMessage({
      tokens: [
        'cBQzZoDrSAKyqfnGuQ2-wA:APA91bGAlrffSbU6ULmt2VfI-elmj-yBT2qDZHHi962-8XFEXNLJpzh3bE2fSUc5mdSiRThw21P8B3Dt5zSe04RM330-O7Thx2jnUejpBhgJNzSxO3K65n8',
      ],
      notification: {
        title: 'Hello',
        body: 'Hello',
      },
    });
  }
}
