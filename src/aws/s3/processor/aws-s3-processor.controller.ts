import { Controller, Param, Post } from '@nestjs/common';
import { AwsTranscoderService } from './aws-transcoder.service';
import { AwsS3Service } from '../aws-s3.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('aws/s3/processor')
export class AwsS3ProcessorController {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly awsTranscoderService: AwsTranscoderService,
  ) {}
  @Post('objects/:id/generate-low-res')
  @ApiParam({ name: 'id', description: 'S3 객체 ID' })
  @ApiOperation({ summary: 'S3 객체의 로우 리소스 생성' })
  @ApiResponse({ status: 200, description: 'S3 객체의 로우 리소스 생성 성공' })
  @ApiResponse({ status: 404, description: 'S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async generateLowRes(@Param('id') id: string) {
    const s3Object = await this.awsS3Service.findOneOrFail(id);
    return await this.awsTranscoderService.generateLowRes({
      s3Object: s3Object,
    });
  }

  @Post('objects/:id/generate-thumbnail')
  @ApiParam({ name: 'id', description: 'S3 객체 ID' })
  @ApiOperation({ summary: 'S3 객체의 썸네일 생성' })
  @ApiResponse({ status: 200, description: 'S3 객체의 썸네일 생성 성공' })
  @ApiResponse({ status: 404, description: 'S3 객체를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async generateThumbnail(@Param('id') id: string) {
    const s3Object = await this.awsS3Service.findOneOrFail(id);
    return await this.awsS3Service.generateImageRowres(s3Object);
  }
}
