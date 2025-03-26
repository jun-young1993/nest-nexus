import { IsString } from 'class-validator';

export class CreateNoticeGroupDto {
  @IsString()
  name: string;
}
