import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { S3ObjectShareService } from './s3-object-share.service';
import { CreateS3ObjectShareDto } from './dto/create-s3-object-share';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AwsS3Service } from './aws-s3.service';
import { S3ObjectShare } from './entities/s3-object-share.entity';

@ApiTags('S3 Object Shares')
@Controller('s3-object-shares')
@UseGuards(JwtAuthGuard)
export class S3ObjectShareController {
  constructor(
    private readonly s3ObjectShareService: S3ObjectShareService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Get(':id')
  @Public()
  @ApiParam({ name: 'id', description: 'S3 객체 공유 ID' })
  @ApiQuery({
    name: 'skip',
    description: '건너뛸 개수',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: '조회할 개수',
    required: false,
    type: Number,
  })
  @ApiOperation({ summary: 'S3 객체 공유 조회' })
  @ApiResponse({ status: 200, description: 'S3 객체 공유 조회 성공' })
  @ApiResponse({ status: 404, description: 'S3 객체 공유를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findOne(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    try {
      const s3Object = await this.awsS3Service.findOneOrFail(id);
      const share = S3ObjectShare.fromJson({
        id: s3Object.id,
        userId: s3Object.user.id,
        user: s3Object.user,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        shareCode: null,
        title: s3Object.originalName,
        description: null,
        s3Object: [s3Object],
      });
      return {
        ...share,
        s3Object: [s3Object],
        pagination: {
          total: 1,
          skip: skip || 0,
          take: take || 10,
          totalPages: Math.ceil(1 / (take || 10)),
        },
      };
    } catch (error) {
      return this.s3ObjectShareService.findOne(id, skip, take);
    }
  }

  @Post()
  @ApiOperation({ summary: 'S3 객체 공유 생성' })
  @ApiBody({ type: CreateS3ObjectShareDto })
  @ApiResponse({ status: 200, description: 'S3 객체 공유 생성 성공' })
  @ApiResponse({ status: 400, description: 'S3 객체 공유 생성 실패' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiBearerAuth()
  async create(
    @Body() createS3ObjectShareDto: CreateS3ObjectShareDto,
    @CurrentUser() user: User,
  ) {
    return this.s3ObjectShareService.create(createS3ObjectShareDto, user);
  }
}
