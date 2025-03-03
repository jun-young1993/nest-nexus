import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParkingLocationService } from './parking-location.service';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { ParkingLocation } from './entities/parking-location.entity';

@ApiTags('Parking Locations')
@Controller('parking-location')
export class ParkingLocationController {
  constructor(
    private readonly parkingLocationService: ParkingLocationService,
  ) {}

  @Post()
  @ApiOperation({ summary: '새로운 주차 위치 생성' })
  @ApiResponse({
    status: 201,
    description: '주차 위치가 성공적으로 생성됨',
    type: ParkingLocation,
  })
  create(@Body() createParkingLocationDto: CreateParkingLocationDto) {
    return this.parkingLocationService.create(createParkingLocationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 주차 위치 조회' })
  @ApiParam({ name: 'id', description: '주차 위치 ID' })
  @ApiResponse({
    status: 200,
    description: '주차 위치 정보를 반환',
    type: ParkingLocation,
  })
  @ApiResponse({
    status: 404,
    description: '주차 위치를 찾을 수 없음',
  })
  findOne(@Param('id') id: string) {
    return this.parkingLocationService.findOne(id);
  }

  // @Patch(':id')
  // @ApiOperation({ summary: '주차 위치 정보 수정' })
  // @ApiParam({ name: 'id', description: '주차 위치 ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: '주차 위치가 성공적으로 수정됨',
  //   type: ParkingLocation,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: '주차 위치를 찾을 수 없음',
  // })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateParkingLocationDto: UpdateParkingLocationDto,
  // ) {
  //   return this.parkingLocationService.update(id, updateParkingLocationDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: '주차 위치 삭제' })
  // @ApiParam({ name: 'id', description: '주차 위치 ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: '주차 위치가 성공적으로 삭제됨',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: '주차 위치를 찾을 수 없음',
  // })
  // remove(@Param('id') id: string) {
  //   return this.parkingLocationService.remove(id);
  // }
}
