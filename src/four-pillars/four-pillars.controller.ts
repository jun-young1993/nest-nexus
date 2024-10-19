import { Controller, Get, Query } from '@nestjs/common';
import { FourPillarsService } from './four-pillars.service';
import { CreateFourPillarDto } from './dto/create-four-pillar.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Code } from '../code/entities/code.entity';
import {create} from "domain";

@ApiTags('four-pillars')
@Controller('four-pillars')
export class FourPillarsController {
  constructor(private readonly fourPillarsService: FourPillarsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve a four pillars based on year, month, day, and hour' })
  @ApiResponse({ status: 200, description: 'Four pillars have been successfully calculated.', type: Code })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  calculateFourPillars(@Query() createFourPillarDto: CreateFourPillarDto) {

    return this.fourPillarsService.calculateFourPillars(createFourPillarDto);
  }
}