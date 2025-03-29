import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LogGroupService } from './log-group.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogGroup } from './entities/log-group.entity';
import { CreateLogGroupDto } from './dto/create-log-group.dto';

@ApiTags('Log Group')
@Controller('log-group')
export class LogGroupController {
  constructor(private readonly logGroupService: LogGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log group' })
  @ApiResponse({
    status: 201,
    description: 'The log group has been successfully created.',
    type: LogGroup,
  })
  create(@Body() createLogGroupDto: CreateLogGroupDto) {
    return this.logGroupService.create(createLogGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all log groups' })
  @ApiResponse({
    status: 200,
    description: 'The log groups have been successfully retrieved.',
    type: [LogGroup],
  })
  findAll() {
    return this.logGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a log group by ID' })
  @ApiResponse({
    status: 200,
    description: 'The log group has been successfully retrieved.',
    type: LogGroup,
  })
  findOne(@Param('id') id: string) {
    return this.logGroupService.findOne(id);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a log group by name' })
  @ApiResponse({
    status: 200,
    description: 'The log group has been successfully retrieved.',
    type: LogGroup,
  })
  findOneByName(@Param('name') name: string) {
    return this.logGroupService.findOneByName(name);
  }

  @Post(':name')
  @ApiOperation({ summary: "Create a new log group if it doesn't exist" })
  @ApiResponse({
    status: 201,
    description: 'The log group has been successfully created.',
    type: LogGroup,
  })
  findOneByNameOrCreate(@Param('name') name: string) {
    return this.logGroupService.findOneByNameOrCreate(name);
  }
}
