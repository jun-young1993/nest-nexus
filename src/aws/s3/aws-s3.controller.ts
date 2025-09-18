import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Param,
  UseGuards,
  Get,
  Query,
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
} from '@nestjs/swagger';
import { AwsS3Service } from './aws-s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AwsS3AppNames } from 'src/config/config.type';
import { S3Object } from './entities/s3-object.entity';

@ApiTags('AWS S3')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('aws/s3')
export class AwsS3Controller {
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
    description: '파일 업로드 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '파일 업로드 실패: 에러 메시지' },
        error: { type: 'string', example: '에러 상세 내용' },
      },
    },
  })
  async uploadFiles(
    @CurrentUser() user: User,
    @Param('appName') appName: AwsS3AppNames,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return await this.awsS3Service.uploaFiles(files, appName, user);
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      return {
        success: false,
        message: `파일 업로드 실패: ${error.message}`,
        error: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'S3 객체 목록 조회' })
  @ApiQuery({ name: 'skip', description: '건너뛸 개수', required: false })
  @ApiQuery({ name: 'take', description: '조회할 개수', required: false })
  @ApiResponse({
    status: 200,
    description: 'S3 객체 목록 조회 성공',
    type: [S3Object],
  })
  @Get('objects')
  async getObjects(
    @CurrentUser() user: User,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return await this.awsS3Service.getObjects(user, {
      skip: skip || 0,
      take: take || 10,
    });
  }
}
