import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CarNumberDto {
  @ApiProperty({ description: '차량 지역 코드 (예: 31)' })
  region: string;

  @ApiProperty({ description: '차량 한글 코드 (예: 가)' })
  category: string;

  @ApiProperty({ description: '차량 일련번호 (예: 1234)' })
  number: string;

  @ApiProperty({ description: '주차 여부', default: true })
  isParked: boolean;

  @ApiProperty({ description: '차량 메세지', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateParkingLocationDto {
  @ApiProperty({ description: '주소' })
  address: string;

  @ApiProperty({ description: '주차 구역 코드' })
  zoneCode: string;

  @ApiProperty({
    description: '주차 위치 타입',
    enum: ['USER_HOME', 'PARKING_SPOT', 'PICKUP_POINT'],
    default: 'USER_HOME',
  })
  type: 'USER_HOME';

  @ApiProperty({ description: '설명', required: false })
  description?: string;

  @ApiProperty({ description: '차량 번호 정보', required: false })
  carNumber?: CarNumberDto;

  @ApiProperty({ description: '차주 전화번호', required: false })
  phoneNumber?: string;
}
