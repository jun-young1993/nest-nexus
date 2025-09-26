import { PartialType } from '@nestjs/swagger';
import { CreateUserStorageLimitDto } from './create-user-storage-limit.dto';

export class UpdateUserStorageLimitDto extends PartialType(CreateUserStorageLimitDto) {}
