import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  // UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SequenceService } from './sequence.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { Sequence } from './entities/sequence.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sequences')
@Controller('sequences')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SequenceController {
  private readonly logger = new Logger(SequenceController.name);

  constructor(private readonly sequenceService: SequenceService) {}

  @Post()
  @ApiOperation({ summary: '시퀀스 생성' })
  @ApiResponse({
    status: 201,
    description: '시퀀스가 성공적으로 생성되었습니다.',
    type: Sequence,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async createSequence(
    @Body() createSequenceDto: CreateSequenceDto,
  ): Promise<Sequence> {
    this.logger.log(`시퀀스 생성 요청: ${createSequenceDto.sequenceName}`);
    return this.sequenceService.createSequence(createSequenceDto);
  }

  @Get()
  @ApiOperation({ summary: '시퀀스 목록 조회' })
  @ApiQuery({ name: 'isActive', description: '활성화 여부', required: false })
  @ApiQuery({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiQuery({ name: 'take', description: '조회할 개수', required: false })
  @ApiResponse({
    status: 200,
    description: '시퀀스 목록이 성공적으로 조회되었습니다.',
    type: [Sequence],
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getSequences(
    @Query('isActive') isActive?: boolean,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<Sequence[]> {
    this.logger.log('시퀀스 목록 조회');

    return this.sequenceService.getSequences(
      {
        skip,
        take,
      },
      isActive !== undefined ? { isActive } : {},
    );
  }

  @Get('stats')
  @ApiOperation({ summary: '시퀀스 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '시퀀스 통계가 성공적으로 조회되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getSequenceStats(): Promise<{
    totalSequences: number;
    activeSequences: number;
    inactiveSequences: number;
  }> {
    this.logger.log('시퀀스 통계 조회');
    return this.sequenceService.getSequenceStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 시퀀스 조회' })
  @ApiParam({ name: 'id', description: '시퀀스 ID' })
  @ApiResponse({
    status: 200,
    description: '시퀀스가 성공적으로 조회되었습니다.',
    type: Sequence,
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getSequence(@Param('id') id: string): Promise<Sequence> {
    this.logger.log(`시퀀스 조회: ${id}`);
    return this.sequenceService.getSequence(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '시퀀스 수정' })
  @ApiParam({ name: 'id', description: '시퀀스 ID' })
  @ApiBody({ type: UpdateSequenceDto })
  @ApiResponse({
    status: 200,
    description: '시퀀스가 성공적으로 수정되었습니다.',
    type: Sequence,
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async updateSequence(
    @Param('id') id: string,
    @Body() updateSequenceDto: UpdateSequenceDto,
  ): Promise<Sequence> {
    this.logger.log(`시퀀스 수정 요청: ${id}`);
    return this.sequenceService.updateSequence(id, updateSequenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '시퀀스 삭제' })
  @ApiParam({ name: 'id', description: '시퀀스 ID' })
  @ApiResponse({
    status: 200,
    description: '시퀀스가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async removeSequence(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`시퀀스 삭제 요청: ${id}`);

    await this.sequenceService.removeSequence(id);
    return { message: '시퀀스가 성공적으로 삭제되었습니다.' };
  }

  @Post('generate')
  @ApiOperation({ summary: '시퀀스 번호 생성' })
  @ApiBody({ type: GenerateSequenceDto })
  @ApiResponse({
    status: 200,
    description: '시퀀스 번호가 성공적으로 생성되었습니다.',
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async generateSequence(
    @Body() generateSequenceDto: GenerateSequenceDto,
  ): Promise<{ sequences: string[] }> {
    this.logger.log(
      `시퀀스 번호 생성 요청: ${generateSequenceDto.sequenceName}`,
    );

    const sequences =
      await this.sequenceService.generateMultipleSequences(generateSequenceDto);
    return { sequences };
  }

  @Post(':id/reset')
  @ApiOperation({ summary: '시퀀스 리셋' })
  @ApiParam({ name: 'id', description: '시퀀스 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newNumber: { type: 'number', default: 0 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '시퀀스가 성공적으로 리셋되었습니다.',
    type: Sequence,
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async resetSequence(
    @Param('id') id: string,
    @Body('newNumber') newNumber: number = 0,
  ): Promise<Sequence> {
    this.logger.log(`시퀀스 리셋 요청: ${id} -> ${newNumber}`);
    return this.sequenceService.resetSequence(id, newNumber);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: '시퀀스 활성화/비활성화 토글' })
  @ApiParam({ name: 'id', description: '시퀀스 ID' })
  @ApiResponse({
    status: 200,
    description: '시퀀스 상태가 성공적으로 변경되었습니다.',
    type: Sequence,
  })
  @ApiResponse({ status: 404, description: '시퀀스를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async toggleSequenceStatus(@Param('id') id: string): Promise<Sequence> {
    this.logger.log(`시퀀스 상태 토글 요청: ${id}`);
    return this.sequenceService.toggleSequenceStatus(id);
  }
}
