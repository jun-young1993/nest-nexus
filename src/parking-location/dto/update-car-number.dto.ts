import { PartialType } from '@nestjs/swagger';
import { CarNumberDto } from './create-parking-location.dto';

export class UpdateCarNumberDto extends PartialType(CarNumberDto) {}
