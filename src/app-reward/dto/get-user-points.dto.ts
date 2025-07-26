import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserPointsDto {
  @ApiProperty({ description: '사용자 ID' })
  @IsUUID()
  userId: string;
}
