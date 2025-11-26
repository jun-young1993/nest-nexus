import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { S3ObjectShareService } from './s3-object-share.service';
import { CreateS3ObjectShareDto } from './dto/create-s3-object-share';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('S3 Object Shares')
@Controller('s3-object-shares')
@UseGuards(JwtAuthGuard)
export class S3ObjectShareController {
  constructor(private readonly s3ObjectShareService: S3ObjectShareService) {}

  @Get(':id')
  @Public()
  @ApiParam({ name: 'id', description: 'S3 객체 공유 ID' })
  @ApiOperation({ summary: 'S3 객체 공유 조회' })
  @ApiResponse({ status: 200, description: 'S3 객체 공유 조회 성공' })
  @ApiResponse({ status: 404, description: 'S3 객체 공유를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findOne(@Param('id') id: string) {
    return this.s3ObjectShareService.findOne(id);
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
