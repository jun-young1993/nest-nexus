import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThreeObjectService } from './three-object.service';
import {
  CreateThreeObjectDto,
  UpdateThreeObjectsDto,
} from './dto/create-three-object.dto';

@ApiTags('Three Objects')
@Controller('three-objects')
export class ThreeObjectController {
  constructor(private readonly threeObjectService: ThreeObjectService) {}

  @Post()
  @ApiOperation({ summary: 'Three.js 객체 생성' })
  @ApiResponse({
    status: 201,
    description: '객체가 성공적으로 생성됨',
    type: CreateThreeObjectDto,
  })
  create(@Body() createThreeObjectDto: CreateThreeObjectDto) {
    return this.threeObjectService.create(createThreeObjectDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 Three.js 객체 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 객체 목록을 반환',
    type: [CreateThreeObjectDto],
  })
  findAll() {
    return this.threeObjectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 Three.js 객체 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 ID의 객체 정보를 반환',
    type: CreateThreeObjectDto,
  })
  @ApiResponse({
    status: 404,
    description: '객체를 찾을 수 없음',
  })
  findOne(@Param('id') id: string) {
    return this.threeObjectService.findOne(id);
  }

  @Put('batch')
  @ApiOperation({ summary: 'Three.js 객체 일괄 업데이트' })
  @ApiResponse({
    status: 200,
    description: '객체들이 성공적으로 처리됨',
    type: [CreateThreeObjectDto],
  })
  updateObjects(@Body() updateDto: UpdateThreeObjectsDto) {
    return this.threeObjectService.updateObjects(updateDto);
  }
}
