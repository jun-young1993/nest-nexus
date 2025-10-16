import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Param,
  UseGuards,
  Get,
  Query,
  Delete,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiHeader,
} from '@nestjs/swagger';
import { AwsS3Service } from './aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AwsS3AppNames } from 'src/config/config.type';
import { S3Object } from './entities/s3-object.entity';
import { CurrentGroupAdminUser } from 'src/auth/decorators/current-group-admin-user.decorator';
import { createNestLogger } from 'src/factories/logger.factory';

@ApiTags('AWS S3')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('aws/s3')
export class AwsS3Controller {
  private readonly logger = createNestLogger(AwsS3Controller.name);
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Post(':appName/upload')
  @ApiParam({
    name: 'appName',
    description: '업로드할 앱 이름 (baby-log)',
    example: 'baby-log',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드 요청',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '업로드할 파일들 (최대 5개)',
          minItems: 1,
          maxItems: 5,
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'baby-log 카테고리로 2개 파일 업로드 완료',
        },
        region: { type: 'string', example: 'us-west-2' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                example:
                  'https://bucket.s3.us-west-2.amazonaws.com/images/1234567890-image.jpg',
              },
              key: { type: 'string', example: 'images/1234567890-image.jpg' },
              originalName: { type: 'string', example: 'image.jpg' },
              size: { type: 'number', example: 1024000 },
              mimetype: { type: 'string', example: 'image/jpeg' },
              region: { type: 'string', example: 'us-west-2' },
              category: { type: 'string', example: 'baby-log' },
              uploadedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 형식 오류, 크기 초과 등)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Bad Request' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류 (파일 업로드 실패)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: '파일 업로드 실패: 에러 메시지' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async uploadFiles(
    @CurrentUser() user: User,
    @Param('appName') appName: AwsS3AppNames,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      this.logger.log('파일 업로드 시작:', { user, appName });

      const result = await this.awsS3Service.uploaFiles(files, appName, user);

      this.logger.log(
        '파일 업로드 완료:',
        result.map((r) => r.id),
      );

      return result;
    } catch (error) {
      this.logger.error(`파일 업로드 에러: ${error.message}`);

      // 비즈니스 로직 에러인 경우 400, 시스템 에러인 경우 500
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: `파일 업로드 실패: ${error.message}`,
        error: error.message,
      });
    }
  }

  @ApiParam({
    name: 'appName',
    description: '앱 이름 (baby-log)',
    example: 'baby-log',
  })
  @Delete(':appName/delete/:id')
  @ApiParam({ name: 'id', description: 'S3 객체 ID' })
  @ApiOperation({ summary: 'S3 객체 삭제' })
  @ApiResponse({ status: 200, description: 'S3 객체 삭제 성공' })
  @ApiResponse({ status: 404, description: 'S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async deleteObject(
    @Param('id') id: string,
    @Param('appName') appName: AwsS3AppNames,
    @CurrentUser() user: User,
  ) {
    return await this.awsS3Service.deleteObject(id, appName, user);
  }

  @ApiOperation({ summary: 'S3 객체 목록 조회' })
  @ApiQuery({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiQuery({ name: 'take', description: '조회할 개수', required: false })
  @ApiHeader({
    name: 'X-Include-User-Group-Admin',
    description: '관리자 권한 포함 여부',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 목록 조회 성공',
    type: [S3Object],
  })
  @Get('objects')
  async getObjects(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return await this.awsS3Service.getObjects([user, groupAdminUser], {
      skip: skip || 0,
      take: take || 10,
    });
  }

  @Get('objects/count')
  @ApiOperation({ summary: 'S3 객체 개수 조회' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 개수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'S3 객체 개수',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getObjectCount(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
  ) {
    const count = await this.awsS3Service.count([user, groupAdminUser]);
    return count;
  }

  @Get('objects/filesize')
  @ApiOperation({ summary: 'S3 객체 파일 크기 조회' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 파일 크기 조회 성공',
    schema: {
      type: 'object',
      properties: {
        size: { type: 'number', description: 'S3 객체 파일 크기' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getObjectFileSize(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
  ) {
    const size = await this.awsS3Service.filesize([user, groupAdminUser]);
    return size;
  }

  @Get('objects/:id')
  @ApiParam({ name: 'id', description: 'S3 객체 ID' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 조회 성공',
    type: S3Object,
  })
  @ApiResponse({ status: 404, description: 'S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getObject(@Param('id') id: string) {
    return await this.awsS3Service.findOneOrFail(id);
  }

  @Get('objects/:id/creation-date')
  @ApiParam({ name: 'id', description: 'S3 객체 ID' })
  @ApiOperation({ summary: 'S3 객체의 파일 생성 날짜 조회' })
  @ApiResponse({
    status: 200,
    description: '파일 생성 날짜 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'S3 객체 ID' },
        originalName: { type: 'string', description: '원본 파일명' },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '데이터베이스 저장 날짜',
        },
        fileCreationDate: {
          type: 'string',
          format: 'date-time',
          description: '파일의 실제 생성 날짜',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getObjectCreationDate(@Param('id') id: string) {
    const s3Object = await this.awsS3Service.findOneOrFail(id);
    return {
      id: s3Object.id,
      originalName: s3Object.originalName,
      createdAt: s3Object.createdAt,
    };
  }

  @Get('objects/year/:year/month/:month/day/:day')
  @ApiParam({ name: 'year', description: '조회 년도 (YYYY)' })
  @ApiParam({ name: 'month', description: '조회 월 (MM)' })
  @ApiParam({ name: 'day', description: '조회 일 (DD)' })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 조회 성공',
    type: [S3Object],
  })
  async getObjectsByDate(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
  ) {
    return await this.awsS3Service.getObjectsByDate(
      [user, groupAdminUser],
      year,
      month,
      day,
    );
  }

  @ApiQuery({
    name: 'take',
    description: '앞뒤로 조회할 개수 (기본값: 2)',
    required: false,
    example: 2,
  })
  @Get('objects/:id/surrounding')
  @ApiParam({ name: 'id', description: '기준 S3 객체 ID' })
  @ApiOperation({ summary: '기준 S3 객체의 앞뒤 N개씩 조회 (기본값: 2개)' })
  @ApiResponse({
    status: 200,
    description: '기준 객체의 앞뒤 데이터 조회 성공',
    schema: {
      type: 'object',
      properties: {
        previous: {
          type: 'array',
          items: { $ref: '#/components/schemas/S3Object' },
          description: '기준 객체 이전 N개 데이터',
        },
        current: {
          $ref: '#/components/schemas/S3Object',
          description: '기준 객체',
        },
        next: {
          type: 'array',
          items: { $ref: '#/components/schemas/S3Object' },
          description: '기준 객체 이후 N개 데이터',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '기준 S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async getSurroundingObjects(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Query('take') take?: number,
  ) {
    return await this.awsS3Service.getSurroundingObjects(
      id,
      [user, groupAdminUser],
      take || 2,
    );
  }

  @Get('objects/year/:year/month/:month/existence')
  @ApiParam({ name: 'year', description: '조회 년도 (YYYY)', example: '2025' })
  @ApiParam({ name: 'month', description: '조회 월 (MM)', example: '09' })
  @ApiOperation({ summary: '해당 월의 날짜별 S3 객체 존재 여부 체크' })
  @ApiResponse({
    status: 200,
    description: '해당 월의 날짜별 객체 존재 여부 조회 성공',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'boolean',
      },
      example: {
        '2025-09-01': true,
        '2025-09-02': false,
        '2025-09-03': true,
        '2025-09-04': false,
        '2025-09-05': true,
        // ... 해당 월의 모든 날짜
        '2025-09-30': false,
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 년도/월 형식' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async checkObjectsExistenceByMonth(
    @CurrentUser() user: User,
    @CurrentGroupAdminUser() groupAdminUser: User,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    // 년도/월 형식 검증
    const yearRegex = /^\d{4}$/;
    const monthRegex = /^(0[1-9]|1[0-2])$/;

    month = month.length === 1 ? '0' + month : month;

    if (!yearRegex.test(year)) {
      throw new Error('잘못된 년도 형식입니다. YYYY 형식을 사용해주세요.');
    }

    if (!monthRegex.test(month)) {
      throw new Error('잘못된 월 형식입니다. MM 형식(01-12)을 사용해주세요.');
    }

    return await this.awsS3Service.checkObjectsExistenceByMonth(year, month, [
      user,
      groupAdminUser,
    ]);
  }
}
