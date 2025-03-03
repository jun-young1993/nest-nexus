import { ApiProperty } from '@nestjs/swagger';

export class PositionDto {
  @ApiProperty({ description: 'X 좌표' })
  x: number;

  @ApiProperty({ description: 'Y 좌표' })
  y: number;

  @ApiProperty({ description: 'Z 좌표' })
  z: number;
}

export class CreateThreeObjectDto {
  @ApiProperty({ description: '객체의 고유 ID' })
  id: string;

  @ApiProperty({ description: '객체의 타입 (예: mesh, geometry 등)' })
  type: string;

  @ApiProperty({ description: '객체의 위치 정보' })
  position: PositionDto;

  @ApiProperty({ description: '객체의 회전 정보' })
  rotation: PositionDto;

  @ApiProperty({ description: '객체의 크기 정보' })
  scale: PositionDto;

  @ApiProperty({ description: '주차 위치 ID' })
  parkingLocationId: string;
}

export class UpdateThreeObjectsDto {
  @ApiProperty({
    type: [CreateThreeObjectDto],
    description: 'Three.js 객체 배열',
  })
  objects: CreateThreeObjectDto[];
}
