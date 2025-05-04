import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarNumberLocationDto {
  @ApiProperty({ description: '주차 위치 고유 ID' })
  zoneCode: string;
}
