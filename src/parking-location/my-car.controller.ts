import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { MyCarService } from './my-car.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarNumber } from './entities/car-number.entity';
import { UpdateCarNumberDto } from './dto/update-car-number.dto';

@ApiTags('My-Car')
@Controller('my-car')
export class MyCarController {
  constructor(private readonly myCarService: MyCarService) {}

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
