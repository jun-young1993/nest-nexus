import { Repository } from 'typeorm';
import { S3ObjectMetadata } from './entities/s3-object-metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateS3MetadataDto } from './dto/create-s3-metadata.dto';
import { S3Object } from './entities/s3-object.entity';

@Injectable()
export class S3ObjectMetadataService {
  constructor(
    @InjectRepository(S3ObjectMetadata)
    private readonly s3ObjectMetadataRepository: Repository<S3ObjectMetadata>,
    @InjectRepository(S3Object)
    private readonly s3ObjectRepository: Repository<S3Object>,
  ) {}

  async create(
    createS3MetadataDto: CreateS3MetadataDto,
  ): Promise<S3ObjectMetadata> {
    const metadata =
      this.s3ObjectMetadataRepository.create(createS3MetadataDto);
    await this.s3ObjectMetadataRepository.save(metadata);
    createS3MetadataDto.s3Object.metadata = metadata;
    await this.s3ObjectRepository.save(createS3MetadataDto.s3Object);
    return metadata;
  }
}
