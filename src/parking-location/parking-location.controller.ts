import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  InternalServerErrorException,
  Query,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParkingLocationService } from './parking-location.service';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { ParkingLocation } from './entities/parking-location.entity';
import { parkingLocationGroupName } from './constance/parking-location.constance';
import { LogGroupService } from 'src/log/log-group.service';
import { NoticeGroupService } from 'src/notice/notice-group.service';
import { NoticeService } from 'src/notice/notice.service';
import { Logger } from 'winston';
import { Notice } from 'src/notice/entities/notice.entity';
import { CreateParkingLocationNoticeDto } from './dto/create-parking-location-notice.dto';
import { LogService } from 'src/log/log.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EventName } from 'src/enums/event-name.enum';
import { ParkingLocationNoticeCreatedEvent } from './events/parking-location-notice-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('Parking Locations')
@Controller('parking-location')
export class ParkingLocationController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly parkingLocationService: ParkingLocationService,
    private readonly noticeGroupService: NoticeGroupService,
    private readonly noticeService: NoticeService,
    private readonly logGroupService: LogGroupService,
    private readonly logService: LogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @ApiOperation({ summary: '새로운 주차 위치 생성' })
  @ApiResponse({
    status: 201,
    description: '주차 위치가 성공적으로 생성됨',
    type: ParkingLocation,
  })
  create(@Body() createParkingLocationDto: CreateParkingLocationDto) {
    this.logger.info('[PARKING-LOCATION][CREATE][PARAMS]');
    this.logger.info(CreateParkingLocationDto);
    return this.parkingLocationService.createMany(createParkingLocationDto);
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

  @Get('/zone/:zoneCode')
  @ApiOperation({ summary: '특정 구역의 모든 주차 위치 조회' })
  @ApiParam({
    name: 'zoneCode',
    description: '구역 코드 (예: "강남구")',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '해당 구역의 모든 주차 위치 정보를 반환',
    type: ParkingLocation,
  })
  @ApiResponse({
    status: 404,
    description: '해당 구역의 주차 위치를 찾을 수 없음',
  })
  findByZoneCode(@Param('zoneCode') zoneCode: string) {
    return this.parkingLocationService.findByZoneCode(zoneCode);
  }

  @Get('/notice/:zoneCode')
  @ApiOperation({ summary: '특정 구역의 공지 조회' })
  @ApiParam({
    name: 'zoneCode',
    description: '구역 코드 (예: "강남구")',
    type: 'string',
  })
  async findZoneNotice(@Param('zoneCode') zoneCode: string) {
    await this.parkingLocationService.findOrCreateNoticeGroup(zoneCode);
    const notice = this.noticeService.findByName(
      parkingLocationGroupName(zoneCode),
    );
    return notice;
  }

  @Get('/log/:zoneCode')
  @ApiOperation({ summary: '특정 구역의 로그 조회' })
  @ApiParam({
    name: 'zoneCode',
    description: '구역 코드 (예: "강남구")',
    type: 'string',
  })
  findZoneLog(
    @Param('zoneCode') zoneCode: string,
    @Query('take') take: number,
  ) {
    if (!take) {
      throw new BadRequestException('take is required');
    }
    const log = this.logService.findByName(parkingLocationGroupName(zoneCode), {
      take: take,
    });
    return log;
  }

  @Post('/notice/:zoneCode')
  @ApiOperation({ summary: '특정 구역의 공지 생성' })
  @ApiParam({
    name: 'zoneCode',
    description: '구역 코드 (예: "강남구")',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: '공지가 성공적으로 생성됨',
    type: Notice,
  })
  async createNotice(
    @Param('zoneCode') zoneCode: string,
    @Body() createNoticeDto: CreateParkingLocationNoticeDto,
  ) {
    const groupNotice = await this.noticeGroupService.findOneByName(
      parkingLocationGroupName(zoneCode),
    );
    if (!groupNotice) {
      throw new InternalServerErrorException('Notice group not found');
    }
    const notice = await this.noticeService.create({
      ...createNoticeDto,
      noticeGroupId: groupNotice.id,
    });
    const parkingLocation =
      await this.parkingLocationService.findByZoneCode(zoneCode);
    this.eventEmitter.emit(
      EventName.PARKING_LOCATION_NOTICE_CREATED,
      new ParkingLocationNoticeCreatedEvent(parkingLocation, notice),
    );

    return notice;
  }
}
