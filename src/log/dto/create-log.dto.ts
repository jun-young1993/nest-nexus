import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  logGroupId: string;
}
