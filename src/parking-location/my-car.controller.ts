import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { MyCarService } from './my-car.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarNumber } from './entities/car-number.entity';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';
import { LogService } from 'src/log/log.service';
import { parkingLocationGroupName } from './constance/parking-location.constance';

@ApiTags('My-Car')
@Controller('my-car')
export class MyCarController {
  constructor(
    private readonly myCarService: MyCarService,
    private readonly logService: LogService,
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

  @Put(':id')
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
    const carNumber = await this.myCarService.update(id, updateCarNumberDto);
    const carFullNumber = `${carNumber.region} ${carNumber.category} ${carNumber.number}`;
    if (updateCarNumberDto.isParked === true) {
      this.logService.createByGroupName(
        parkingLocationGroupName(carNumber.parkingLocation.zoneCode),
        `${carFullNumber} 차량이 주차 되었습니다.`,
      );
    } else if (updateCarNumberDto.isParked === false) {
      this.logService.createByGroupName(
        parkingLocationGroupName(carNumber.parkingLocation.zoneCode),
        `${carFullNumber} 차량이 출차 되었습니다.`,
      );
    }
    return carNumber;
  }
}
