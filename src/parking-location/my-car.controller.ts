import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { MyCarService } from './my-car.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarNumber } from './entities/car-number.entity';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';
import {
  CarStatusChangedEvent,
  CarStatus,
} from './events/notification/event/car-status-changed.event';
import { CarNotificationService } from './events/notification/service/car-notification.service';

@ApiTags('My-Car')
@Controller('my-car')
export class MyCarController {
  constructor(
    private readonly myCarService: MyCarService,
    private readonly carNotificationService: CarNotificationService,
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
    const originalCarNumber = await this.myCarService.findOne(id);
    const carNumber = await this.myCarService.update(id, updateCarNumberDto);

    // 상태 변경 이벤트 생성
    if (originalCarNumber.isParked !== updateCarNumberDto.isParked) {
      const event = new CarStatusChangedEvent(
        carNumber,
        originalCarNumber.isParked,
        updateCarNumberDto.isParked,
        updateCarNumberDto.isParked ? CarStatus.PARKED : CarStatus.UNPARKED,
      );

      // 알림 처리
      await this.carNotificationService.handleStatusChange(event);
    }

    return carNumber;
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
}
