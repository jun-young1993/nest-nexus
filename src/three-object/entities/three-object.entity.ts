import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ParkingLocation } from '../../parking-location/entities/parking-location.entity';

@Entity()
export class ThreeObject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column('float')
  positionX: number;

  @Column('float')
  positionY: number;

  @Column('float')
  positionZ: number;

  @Column('float')
  rotationX: number;

  @Column('float')
  rotationY: number;

  @Column('float')
  rotationZ: number;

  @Column('float')
  scaleX: number;

  @Column('float')
  scaleY: number;

  @Column('float')
  scaleZ: number;

  @ManyToOne(
    () => ParkingLocation,
    (parkingLocation) => parkingLocation.threeObjects,
  )
  @JoinColumn({ name: 'parkingLocationId' })
  parkingLocation: ParkingLocation;

  @Column()
  parkingLocationId: string;
}
