import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MyCarService } from './my-car.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarNumber } from './entities/car-number.entity';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';
import { SendFcmDto } from './dto/send-fcm.dto';
import { MyHomeParkingFcmService } from 'src/firebase/fcm/my-home-parking-fcm.service';
import { LogService } from 'src/log/log.service';
import { parkingLocationGroupName } from './constance/parking-location.constance';
import { UpdateCarNumberLocationDto } from './dto/update-car-number-location.dto';
import { ParkingLocationService } from './parking-location.service';

@ApiTags('My-Car')
@Controller('my-car')
export class MyCarController {
  constructor(
    private readonly myHomeParkingFcmService: MyHomeParkingFcmService,
    private readonly myCarService: MyCarService,
    private readonly logService: LogService,
    private readonly parkingLocationService: ParkingLocationService,
  ) {}

  @Get()
  @ApiOperation({ summary: '차량 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '차량 목록 조회 성공',
    type: CarNumber,
    isArray: true,
  })
  findAll(): Promise<CarNumber[]> {
    return this.myCarService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '차량 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '차량 상세 조회 성공',
    type: CarNumber,
  })
  findOne(@Param('id') id: string): Promise<CarNumber> {
    return this.myCarService.findOne(id);
  }

  @Put('parking/:id')
  @ApiOperation({ summary: '차량 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '차량 정보 수정 성공',
    type: CarNumber,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCarNumberDto: UpdateCarNumberDto,
  ): Promise<CarNumber> {
    return this.myCarService.update(id, updateCarNumberDto);
  }

  @Put('location/:id')
  @ApiOperation({ summary: '차량 위치 수정' })
  @ApiResponse({
    status: 200,
    description: '차량 위치 수정 성공',
    type: CarNumber,
  })
  async updateLocation(
    @Param('id') id: string,
    @Body() updateCarNumberLocationDto: UpdateCarNumberLocationDto,
  ) {
    const parkingLocation = await this.parkingLocationService.create({
      zoneCode: updateCarNumberLocationDto.zoneCode,
    });

    const carNumber = await this.myCarService.findOne(id);
    carNumber.parkingLocationId = parkingLocation.id;
    return this.myCarService.update(id, carNumber);
  }

  @Put('message/:id')
  @ApiOperation({ summary: '차량 메세지 수정' })
  @ApiResponse({
    status: 200,
    description: '차량 메세지 수정 성공',
    type: CarNumber,
  })
  async updateMessage(
    @Param('id') id: string,
    @Body() updateCarNumberDto: UpdateCarNumberDto,
  ): Promise<CarNumber> {
    return this.myCarService.update(id, updateCarNumberDto);
  }

  @Post('/send-fcm')
  @ApiOperation({ summary: 'FCM 메시지 전송' })
  @ApiParam({ name: 'zoneCode', description: '구역 코드 (예: "강남구")' })
  @ApiResponse({
    status: 200,
    description: 'FCM 메시지가 성공적으로 전송됨',
  })
  async sendFcm(@Body() sendFcmDto: SendFcmDto) {
    const { targetCarNumberId, senderCarNumberId, message } = sendFcmDto;
    const targetCarNumber = await this.myCarService.findOne(targetCarNumberId);
    const senderCarNumber = await this.myCarService.findOne(senderCarNumberId);

    const title = `[${senderCarNumber.fullNumber}]님이 [${targetCarNumber.fullNumber}]님에게 메시지를 보냈습니다.`;
    const body = message;

    const result = await this.myHomeParkingFcmService.sendMessage({
      tokens: [targetCarNumber.fcmToken],
      notification: {
        title,
        body,
      },
    });
    await this.logService.createByGroupName(
      parkingLocationGroupName(targetCarNumber.parkingLocation.zoneCode),
      `${title} \r\n${body}`,
    );
    return result;
  }
}
