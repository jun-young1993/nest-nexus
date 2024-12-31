import { IsString } from 'class-validator';

export class CallbackQueryDto {
  @IsString()
  code: string;
}
