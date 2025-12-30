import { Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { AwsS3Service } from './s3/aws-s3.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3ObjectDestinationType } from './s3/enum/s3-object-destination.type';
import { IsNull } from 'typeorm';
import { createNestLogger } from 'src/factories/logger.factory';
import { calculateChecksum } from 'src/utils/stremes/check-sum';
import { S3ObjectMetadataService } from './s3/s3-object-metadata.service';
import { S3ObjectMetadata } from './s3/entities/s3-object-metadata.entity';
import { CloudRunEmotionService } from 'src/cloud-run/emotion/cloud-run-emotion.service';
import { CreateS3MetadataDto } from './s3/dto/create-s3-metadata.dto';

@ApiTags('S3 Object Migration')
@Controller('s3-object-migration')
export class S3ObjectMigrationController {
  private readonly logger = createNestLogger(S3ObjectMigrationController.name);
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly s3ObjectMetadataService: S3ObjectMetadataService,
    private readonly cloudRunEmotionService: CloudRunEmotionService,
  ) {}

  @Post('checksum')
  @ApiOperation({ summary: 'Migrate S3 Object' })
  async migrateS3Object() {
    try {
      const s3ObjectList = await this.awsS3Service.getObjects({
        where: [
          {
            metadata: {
              checksum: IsNull(),
            },
            destination: S3ObjectDestinationType.UPLOAD,
          },
        ],
        relations: ['metadata'],
      });

      for (const s3Object of s3ObjectList) {
        try {
          const readable = await this.awsS3Service.getObjectCommand(s3Object);
          const checksum = await calculateChecksum(readable);
          let metadata: S3ObjectMetadata;
          if (s3Object.metadata) {
            s3Object.metadata.checksum = checksum;
            metadata = await this.s3ObjectMetadataService.update(
              s3Object.metadata,
            );
          } else {
            metadata = await this.s3ObjectMetadataService.create({
              s3Object: s3Object,
              checksum: checksum,
            });
          }
          console.log(metadata.checksum);
        } catch (error) {
          this.logger.error(error);
          continue;
        }
      }
    } catch (error) {
      console.log(error.stack);

      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post('caption')
  @ApiOperation({ summary: 'Migrate S3 Object Caption' })
  async migrateS3ObjectCaption() {
    try {
      const s3ObjectList = await this.awsS3Service.getObjects({
        where: [
          {
            metadata: {
              caption: IsNull(),
            },
            destination: S3ObjectDestinationType.UPLOAD,
          },
        ],
        relations: ['metadata'],
      });
      if (s3ObjectList.length === 0) {
        return;
      }
      for (const s3Object of s3ObjectList) {
        try {
          if (s3Object.metadata && s3Object.metadata.caption === null) {
            const caption = await this.cloudRunEmotionService.imageToCaption(
              s3Object.url,
            );
            s3Object.metadata.caption = caption.text;

            console.log('[created caption]', caption.text);
            await this.s3ObjectMetadataService.update(s3Object.metadata);
          } else {
            const caption = await this.cloudRunEmotionService.imageToCaption(
              s3Object.url,
            );
            const metadata = await this.s3ObjectMetadataService.create(
              CreateS3MetadataDto.fromJson({
                s3Object: s3Object,
                caption: caption.text,
              }),
            );
            console.log('[created caption]', metadata.caption);
          }
        } catch (error) {
          this.logger.error(error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
