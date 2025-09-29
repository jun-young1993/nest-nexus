import { PartialType } from '@nestjs/swagger';
import { CreateS3ObjectTagDto } from './create-s3-object-tag.dto';

export class UpdateS3ObjectTagDto extends PartialType(CreateS3ObjectTagDto) {}
