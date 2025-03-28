import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLogGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
