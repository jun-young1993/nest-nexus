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
  UseGuards,
  Request,
  BadRequestException,
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
import { UserBlockService } from './user-block.service';
import { CreateUserBlockDto } from './dto/create-user-block.dto';
import { UnblockUserDto } from './dto/unblock-user.dto';
import { UserBlock, BlockStatus } from './entities/user-block.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('user-blocks')
@Controller('user-blocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserBlockController {
  private readonly logger = new Logger(UserBlockController.name);

  constructor(private readonly userBlockService: UserBlockService) {}

  @Post()
  @ApiOperation({ summary: '사용자 블록 생성' })
  @ApiResponse({
    status: 201,
    description: '사용자가 성공적으로 블록되었습니다.',
    type: UserBlock,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async createUserBlock(
    @Request() req: any,
    @Body() createUserBlockDto: CreateUserBlockDto,
  ): Promise<UserBlock> {
    const blockerId = req.user.id;
    this.logger.log(
      `사용자 블록 생성 요청: ${blockerId} -> ${createUserBlockDto.blockedId}`,
    );
    if (blockerId === createUserBlockDto.blockedId) {
      throw new BadRequestException('자기 자신을 블록할 수 없습니다.');
    }
    return this.userBlockService.createUserBlock(blockerId, createUserBlockDto);
  }

  @Get()
  @ApiOperation({ summary: '내가 블록한 사용자 목록 조회' })
  @ApiQuery({
    name: 'status',
    description: '블록 상태',
    required: false,
    enum: BlockStatus,
  })
  @ApiQuery({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiQuery({ name: 'take', description: '조회할 개수', required: false })
  @ApiResponse({
    status: 200,
    description: '블록한 사용자 목록이 성공적으로 조회되었습니다.',
    type: [UserBlock],
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getMyBlockedUsers(
    @Request() req: any,
    @Query('status') status?: BlockStatus,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<UserBlock[]> {
    const blockerId = req.user.id;
    this.logger.log(`블록한 사용자 목록 조회: ${blockerId}`);

    return this.userBlockService.getUserBlocks(
      blockerId,
      {
        skip,
        take,
      },
      status ? { status } : {},
    );
  }

  @Get('blockers')
  @ApiOperation({ summary: '나를 블록한 사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '나를 블록한 사용자 목록이 성공적으로 조회되었습니다.',
    type: [UserBlock],
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getMyBlockers(@Request() req: any): Promise<UserBlock[]> {
    const blockedId = req.user.id;
    this.logger.log(`나를 블록한 사용자 목록 조회: ${blockedId}`);
    return this.userBlockService.getBlockers(blockedId);
  }

  @Get('stats')
  @ApiOperation({ summary: '사용자 블록 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 블록 통계가 성공적으로 조회되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getUserBlockStats(@Request() req: any): Promise<{
    blockedCount: number;
    blockerCount: number;
    totalBlocks: number;
  }> {
    const userId = req.user.id;
    this.logger.log(`사용자 블록 통계 조회: ${userId}`);
    return this.userBlockService.getUserBlockStats(userId);
  }

  @Get('check/:blockedId')
  @ApiOperation({ summary: '특정 사용자 블록 여부 확인' })
  @ApiParam({ name: 'blockedId', description: '확인할 사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '사용자 블록 여부가 성공적으로 확인되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async checkUserBlock(
    @Request() req: any,
    @Param('blockedId') blockedId: string,
  ): Promise<{ isBlocked: boolean }> {
    const blockerId = req.user.id;
    this.logger.log(`사용자 블록 여부 확인: ${blockerId} -> ${blockedId}`);

    const isBlocked = await this.userBlockService.isUserBlocked(
      blockerId,
      blockedId,
    );
    return { isBlocked };
  }

  @Patch(':blockedId/unblock')
  @ApiOperation({ summary: '사용자 블록 해제' })
  @ApiParam({ name: 'blockedId', description: '블록 해제할 사용자 ID' })
  @ApiBody({ type: UnblockUserDto })
  @ApiResponse({
    status: 200,
    description: '사용자 블록이 성공적으로 해제되었습니다.',
    type: UserBlock,
  })
  @ApiResponse({
    status: 404,
    description: '블록된 사용자를 찾을 수 없습니다.',
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async unblockUser(
    @Request() req: any,
    @Param('blockedId') blockedId: string,
    @Body() unblockUserDto: UnblockUserDto,
  ): Promise<UserBlock> {
    const blockerId = req.user.id;
    this.logger.log(`사용자 블록 해제 요청: ${blockerId} -> ${blockedId}`);
    return this.userBlockService.unblockUser(
      blockerId,
      blockedId,
      unblockUserDto,
    );
  }

  @Delete(':blockedId')
  @ApiOperation({ summary: '사용자 블록 삭제' })
  @ApiParam({ name: 'blockedId', description: '블록 삭제할 사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '사용자 블록이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '블록 정보를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async removeUserBlock(
    @Request() req: any,
    @Param('blockedId') blockedId: string,
  ): Promise<{ message: string }> {
    const blockerId = req.user.id;
    this.logger.log(`사용자 블록 삭제 요청: ${blockerId} -> ${blockedId}`);

    await this.userBlockService.removeUserBlock(blockerId, blockedId);
    return { message: '사용자 블록이 성공적으로 삭제되었습니다.' };
  }
}
