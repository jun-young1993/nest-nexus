import { PartialType } from '@nestjs/swagger';
import { CreateThreeObjectDto } from './create-three-object.dto';

export class UpdateThreeObjectDto extends PartialType(CreateThreeObjectDto) {}
