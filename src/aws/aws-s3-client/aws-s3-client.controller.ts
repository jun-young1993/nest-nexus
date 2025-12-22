import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AwsS3ClientService } from './aws-s3-client.service';
import { ListObjectsQueryDto } from './dto/list-objects-query.dto';
import { ListObjectsResponseDto } from './dto/list-objects-response.dto';
import { MigrateBucketQueryDto } from './dto/migrate-bucket-query.dto';
import { MigrateBucketResponseDto } from './dto/migrate-bucket-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { MigrateCreateLowResAndThumbnailQueryDto } from './dto/migrate-create-low-res-and-thumbnail.dto';
import { AwsS3Service } from '../s3/aws-s3.service';
import { S3ObjectDestinationType } from '../s3/enum/s3-object-destination.type';
import { createNestLogger } from 'src/factories/logger.factory';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Object } from '../s3/entities/s3-object.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventName } from 'src/enums/event-name.enum';
import { S3CreatedEvent } from '../s3/events/s3-created.event';

@ApiTags('AWS S3 Client')
@Controller('aws/s3-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AwsS3ClientController {
  private readonly logger = createNestLogger(AwsS3ClientController.name);
  constructor(
    private readonly awsS3ClientService: AwsS3ClientService,
    private readonly awsS3Service: AwsS3Service,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
    return await this.awsS3ClientService.listObjects(query);
  }

  @Post('migrate/bucket')
  @ApiOperation({
    summary: 'Migrate S3 bucket objects to database',
    description:
      'Scans the specified S3 bucket and migrates objects that do not exist in the database. Objects are identified by key and checksum to avoid duplicates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration completed successfully',
    type: MigrateBucketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  async migrateAwsS3BucketToDatabase(
    @Query() query: MigrateBucketQueryDto,
    @CurrentUser() user: User,
  ): Promise<MigrateBucketResponseDto> {
    return await this.awsS3ClientService.migrateBucket(query, user);
  }

  @Post('migrate/create-low-res-and-thumbnail')
  @ApiOperation({
    summary: 'Migrate create low res and thumbnail',
    description: 'Migrate create low res and thumbnail',
  })
  async migrateCreateLowResAndThumbnail(
    @Query() params: MigrateCreateLowResAndThumbnailQueryDto,
    @CurrentUser() user: User,
  ) {
    const s3Objects = await this.s3ObjectRepository
      .createQueryBuilder('s3Object')
      .leftJoinAndSelect('s3Object.thumbnail', 'thumbnail')
      .leftJoinAndSelect('s3Object.lowRes', 'lowRes')
      .leftJoinAndSelect('s3Object.user', 'user')
      .where('s3Object.appName = :appName', { appName: params.appName })
      .andWhere('s3Object.userId = :userId', { userId: user.id })
      .andWhere('s3Object.destination = :destination', {
        destination: S3ObjectDestinationType.UPLOAD,
      })
      .andWhere('(thumbnail.id IS NULL OR lowRes.id IS NULL)')
      .limit(params.limit)
      .getMany();

    const s3ObjectsWithUrls =
      await this.awsS3Service.generateGetObjectPresigendUrls(s3Objects);

    this.logger.log(`Found ${s3ObjectsWithUrls.length} objects to migrate`);

    for (const s3Object of s3ObjectsWithUrls) {
      try {
        this.eventEmitter.emit(
          EventName.S3_OBJECT_CREATED,
          new S3CreatedEvent(s3Object),
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate create low res and thumbnail: ${s3Object.key}: ${error.message}`,
        );
      }
    }
  }
}
