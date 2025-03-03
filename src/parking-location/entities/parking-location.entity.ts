import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThreeObject } from '../../three-object/entities/three-object.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ParkingLocation {
  @ApiProperty({ description: '주차 위치 고유 ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '주소' })
  @Column()
  address: string;

  @ApiProperty({ description: '주차 구역 코드' })
  @Column()
  zoneCode: string;

  @ApiProperty({
    description: '주차 위치 타입',
    enum: ['USER_HOME', 'PARKING_SPOT', 'PICKUP_POINT'],
    default: 'USER_HOME',
  })
  @Column({
    type: 'enum',
    enum: ['USER_HOME', 'PARKING_SPOT', 'PICKUP_POINT'],
    default: 'USER_HOME',
  })
  type: string;

  @ApiProperty({ description: '설명', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '차량 지역 코드' })
  @Column({ nullable: true })
  carRegionCode: string;

  @ApiProperty({ description: '차량 한글 코드' })
  @Column({ nullable: true })
  carKoreanCode: string;

  @ApiProperty({ description: '차량 일련번호' })
  @Column({ nullable: true })
  carSerialNumber: string;

  @ApiProperty({ description: ' 차주 번호' })
  @Column({ nullable: true })
  phoneNumber: string;

  @OneToMany(() => ThreeObject, (threeObject) => threeObject.parkingLocation)
  threeObjects: ThreeObject[];
}
