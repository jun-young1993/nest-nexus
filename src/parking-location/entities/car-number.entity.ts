import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ParkingLocation } from './parking-location.entity';

@Entity()
export class CarNumber {
  @ApiProperty({ description: '차량 번호 고유 ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '차량 지역 코드 (예: 31)' })
  @Column()
  region: string;

  @ApiProperty({ description: '차량 한글 코드 (예: 가)' })
  @Column()
  category: string;

  @ApiProperty({ description: '차량 일련번호 (예: 1234)' })
  @Column()
  number: string;

  @ApiProperty({ description: '차량 주차 여부' })
  @Column({ default: true })
  isParked: boolean;

  @ApiProperty({ description: ' 차주 번호' })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({ description: '차량 메세지' })
  @Column({ nullable: true })
  message?: string;

  @ApiProperty({ description: 'FCM TOKEN' })
  @Column()
  fcmToken: string;

  @ApiProperty({ description: '최종 업데이트 시간 (상태 변경 시간으로 활용)' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ParkingLocation,
    (parkingLocation) => parkingLocation.carNumbers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'parkingLocationId' })
  parkingLocation: ParkingLocation;

  @Column()
  parkingLocationId: string;

  // 계산된 속성
  fullNumber: string;
  jsonData: Record<string, any>;

  @AfterLoad()
  afterLoad() {
    this.fullNumber = `${this.region} ${this.category} ${this.number}`;
    this.jsonData = {
      id: this.id,
      region: this.region,
      category: this.category,
      number: this.number,
      isParked: this.isParked,
      phoneNumber: this.phoneNumber,
      message: this.message,
      fcmToken: this.fcmToken,
      parkingLocationId: this.parkingLocationId,
      fullNumber: this.fullNumber,
    };
  }
}
