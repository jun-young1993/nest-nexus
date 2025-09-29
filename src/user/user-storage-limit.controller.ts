import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserStorageLimitService } from './user-storage-limit.service';
import { CreateUserStorageLimitDto } from './dto/create-user-storage-limit.dto';
import { UpdateUserStorageLimitDto } from './dto/update-user-storage-limit.dto';
import {
  UserStorageLimit,
  StorageLimitType,
} from './entities/user-storage-limit.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { CurrentGroupAdminUser } from 'src/auth/decorators/current-group-admin-user.decorator';

@ApiTags('User Storage Limits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-storage-limits')
export class UserStorageLimitController {
  constructor(
    private readonly userStorageLimitService: UserStorageLimitService,
  ) {}

  @Post()
  @ApiOperation({ summary: '사용자 스토리지 제한 생성' })
  @ApiBody({ type: CreateUserStorageLimitDto })
  @ApiResponse({
    status: 201,
    description: '스토리지 제한 생성 성공',
    type: UserStorageLimit,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async create(
    @Body() createDto: CreateUserStorageLimitDto,
  ): Promise<UserStorageLimit> {
    return await this.userStorageLimitService.create(createDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자의 모든 스토리지 제한 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '스토리지 제한 목록 조회 성공',
    type: [UserStorageLimit],
  })
  async findByUserId(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
  ): Promise<UserStorageLimit[]> {
    return await this.userStorageLimitService.findByUserId([
      user,
      groupAdminUser,
    ]);
  }

  @Get('user/:userId/type/:limitType')
  @ApiOperation({ summary: '특정 타입의 스토리지 제한 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({
    name: 'limitType',
    enum: StorageLimitType,
    description: '제한 타입',
  })
  @ApiResponse({
    status: 200,
    description: '스토리지 제한 조회 성공',
    type: UserStorageLimit,
  })
  @ApiResponse({ status: 404, description: '제한을 찾을 수 없음' })
  async findByUserIdAndType(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Param('limitType') limitType: StorageLimitType,
  ): Promise<UserStorageLimit | null> {
    return await this.userStorageLimitService.findByUserIdAndType(
      [user, groupAdminUser],
      limitType,
    );
  }

  @Get('user/:userId/check/:limitType')
  @ApiOperation({ summary: '제한 초과 여부 확인' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({
    name: 'limitType',
    enum: StorageLimitType,
    description: '제한 타입',
  })
  @ApiResponse({
    status: 200,
    description: '제한 초과 여부 확인 성공',
    schema: {
      type: 'object',
      properties: {
        isOverLimit: { type: 'boolean' },
        currentUsage: { type: 'number' },
        limitValue: { type: 'number' },
        remainingSpace: { type: 'number' },
      },
    },
  })
  async checkLimit(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Param('limitType') limitType: StorageLimitType,
  ) {
    return await this.userStorageLimitService.isOverLimit(
      [user, groupAdminUser],
      limitType,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: '스토리지 제한 업데이트' })
  @ApiParam({ name: 'id', description: '스토리지 제한 ID' })
  @ApiBody({ type: UpdateUserStorageLimitDto })
  @ApiResponse({
    status: 200,
    description: '스토리지 제한 업데이트 성공',
    type: UserStorageLimit,
  })
  @ApiResponse({ status: 404, description: '제한을 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserStorageLimitDto,
  ): Promise<UserStorageLimit> {
    return await this.userStorageLimitService.update(id, updateDto);
  }

  @Patch(':id/usage')
  @ApiOperation({ summary: '현재 사용량 업데이트' })
  @ApiParam({ name: 'id', description: '스토리지 제한 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newUsage: { type: 'number', description: '새로운 사용량 (바이트)' },
      },
      required: ['newUsage'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '사용량 업데이트 성공',
    type: UserStorageLimit,
  })
  async updateUsage(
    @Body('newUsage') newUsage: number,
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
  ): Promise<UserStorageLimit> {
    // ID로 제한 정보를 먼저 조회
    const storageLimit = await this.userStorageLimitService.findByUserIdAndType(
      [user, groupAdminUser],
      StorageLimitType.S3_STORAGE,
    );
    if (!storageLimit) {
      throw new Error('Storage limit not found');
    }

    return await this.userStorageLimitService.updateCurrentUsage(
      [user, groupAdminUser],
      storageLimit.limitType,
      newUsage,
    );
  }

  @Post('user/:userId/usage/increase')
  @ApiOperation({ summary: '사용량 증가' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        limitType: {
          enum: [StorageLimitType],
          description: '제한 타입',
        },
        increment: { type: 'number', description: '증가할 사용량 (바이트)' },
      },
      required: ['limitType', 'increment'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '사용량 증가 성공',
    type: UserStorageLimit,
  })
  async increaseUsage(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Body('limitType') limitType: StorageLimitType,
    @Body('increment') increment: number,
  ): Promise<UserStorageLimit> {
    return await this.userStorageLimitService.increaseUsage(
      [user, groupAdminUser],
      limitType,
      increment,
    );
  }

  @Post('user/:userId/usage/decrease')
  @ApiOperation({ summary: '사용량 감소' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        limitType: { enum: [StorageLimitType], description: '제한 타입' },
        decrement: { type: 'number', description: '감소할 사용량 (바이트)' },
      },
      required: ['limitType', 'decrement'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '사용량 감소 성공',
    type: UserStorageLimit,
  })
  async decreaseUsage(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Body('limitType') limitType: StorageLimitType,
    @Body('decrement') decrement: number,
  ): Promise<UserStorageLimit> {
    return await this.userStorageLimitService.decreaseUsage(
      [user, groupAdminUser],
      limitType,
      decrement,
    );
  }

  @Post('user/:userId/usage/add-file')
  @ApiOperation({ summary: '파일 크기 추가' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        limitType: { enum: [StorageLimitType], description: '제한 타입' },
        fileSize: { type: 'number', description: '추가할 파일 크기 (바이트)' },
      },
      required: ['limitType', 'fileSize'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '파일 크기 추가 성공',
    type: UserStorageLimit,
  })
  async addFileSize(
    @CurrentUser() user: User,
    @Body('limitType') limitType: StorageLimitType,
    @Body('fileSize') fileSize: number,
  ): Promise<UserStorageLimit> {
    return await this.userStorageLimitService.addFileSize(
      user,
      limitType,
      fileSize,
    );
  }

  @Post('default/s3')
  @ApiOperation({ summary: '기본 제한 설정 생성' })
  @ApiResponse({
    status: 201,
    description: '기본 제한 설정 생성 성공',
    type: [UserStorageLimit],
  })
  @HttpCode(HttpStatus.CREATED)
  async initializeS3StorageLimit(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
  ): Promise<UserStorageLimit> {
    const storage = await this.userStorageLimitService.findByUserIdAndType(
      [user, groupAdminUser],
      StorageLimitType.S3_STORAGE,
    );
    if (storage) {
      return storage;
    }
    return await this.userStorageLimitService.createDefaultLimits(user, {
      limitType: StorageLimitType.S3_STORAGE,
      limitValue: 1073741824, // 1GB
      description: '기본 S3 스토리지 용량 제한',
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: '스토리지 제한 삭제' })
  @ApiParam({ name: 'id', description: '스토리지 제한 ID' })
  @ApiResponse({ status: 204, description: '스토리지 제한 삭제 성공' })
  @ApiResponse({ status: 404, description: '제한을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.userStorageLimitService.remove(id);
  }

  @Post('cleanup/expired')
  @ApiOperation({ summary: '만료된 제한들 정리' })
  @ApiResponse({
    status: 200,
    description: '만료된 제한 정리 완료',
    schema: {
      type: 'object',
      properties: {
        cleanedCount: { type: 'number', description: '정리된 제한 개수' },
      },
    },
  })
  async cleanupExpiredLimits(): Promise<{ cleanedCount: number }> {
    const cleanedCount =
      await this.userStorageLimitService.cleanupExpiredLimits();
    return { cleanedCount };
  }
}
