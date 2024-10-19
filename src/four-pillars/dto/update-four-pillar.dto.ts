import { PartialType } from '@nestjs/swagger';
import { CreateFourPillarDto } from './create-four-pillar.dto';

export class UpdateFourPillarDto extends PartialType(CreateFourPillarDto) {}
