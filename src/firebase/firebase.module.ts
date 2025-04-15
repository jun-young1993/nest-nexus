import { Module } from '@nestjs/common';
import { MyHomeParkingFcmService } from './fcm/my-home-parking-fcm.service';
import { MyHomeParkingFcmController } from './fcm/my-home-parking-fcm.controller';

@Module({
  providers: [MyHomeParkingFcmService],
  exports: [MyHomeParkingFcmService],
  controllers: [MyHomeParkingFcmController],
})
export class FirebaseModule {}
