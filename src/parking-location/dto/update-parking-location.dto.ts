import { PartialType } from '@nestjs/swagger';
import { CreateParkingLocationDto } from './create-parking-location.dto';

export class UpdateParkingLocationDto extends PartialType(
  CreateParkingLocationDto,
) {}
