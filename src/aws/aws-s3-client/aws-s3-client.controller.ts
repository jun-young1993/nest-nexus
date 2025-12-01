import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AwsS3ClientService } from './aws-s3-client.service';
import { ListObjectsQueryDto } from './dto/list-objects-query.dto';
import { ListObjectsResponseDto } from './dto/list-objects-response.dto';

@ApiTags('AWS S3 Client')
@Controller('aws/s3-client')
export class AwsS3ClientController {
  constructor(private readonly awsS3ClientService: AwsS3ClientService) {}

  @Get('objects')
  @ApiOperation({
    summary: 'List S3 objects with pagination',
    description:
      'Given a bucket, region, and optional folder prefix, returns a paginated list of objects.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paged list of S3 objects',
    type: ListObjectsResponseDto,
  })
  async listObjects(
    @Query() query: ListObjectsQueryDto,
  ): Promise<ListObjectsResponseDto> {
    console.log(query);
    return await this.awsS3ClientService.listObjects(query);
  }
}
