import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLogDto } from './dto/create-log.dto';
import { Log } from './entities/log.entity';

@Controller('log')
@ApiTags('Log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log' })
  @ApiResponse({
    status: 201,
    description: 'The log has been successfully created.',
    type: Log,
  })
  create(@Body() createLogDto: CreateLogDto) {
    return this.logService.create(createLogDto);
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({
    status: 200,
    description: 'The logs have been successfully retrieved.',
    type: [Log],
  })
  findAllByGroupId(@Param('groupId') groupId: string) {
    return this.logService.findAllByGroupId(groupId);
  }
}
