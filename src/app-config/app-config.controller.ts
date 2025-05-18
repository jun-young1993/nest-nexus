import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppConfigService } from './app-config.service';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';

@ApiTags('app-config')
@Controller('app-config')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  @ApiOperation({ summary: '앱 설정 생성' })
  @ApiResponse({
    status: 201,
    description: '앱 설정이 성공적으로 생성되었습니다.',
  })
  create(@Body() createAppConfigDto: CreateAppConfigDto) {
    return this.appConfigService.create(createAppConfigDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 앱 설정 조회' })
  @ApiResponse({ status: 200, description: '모든 앱 설정을 반환합니다.' })
  findAll() {
    return this.appConfigService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: '특정 키의 앱 설정 조회' })
  @ApiResponse({ status: 200, description: '특정 키의 앱 설정을 반환합니다.' })
  findOne(@Param('key') key: string) {
    return this.appConfigService.findOne(key);
  }

  @Get('version/:version')
  @ApiOperation({ summary: '특정 버전의 앱 설정 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 버전의 앱 설정을 반환합니다.',
  })
  findByVersion(@Param('version') version: string) {
    return this.appConfigService.findByVersion(version);
  }

  @Patch(':key')
  @ApiOperation({ summary: '앱 설정 업데이트' })
  @ApiResponse({
    status: 200,
    description: '앱 설정이 성공적으로 업데이트되었습니다.',
  })
  update(
    @Param('key') key: string,
    @Body() updateAppConfigDto: UpdateAppConfigDto,
  ) {
    return this.appConfigService.update(key, updateAppConfigDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: '앱 설정 삭제' })
  @ApiResponse({
    status: 200,
    description: '앱 설정이 성공적으로 삭제되었습니다.',
  })
  remove(@Param('key') key: string) {
    return this.appConfigService.remove(key);
  }
}
