import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreeObjectService } from './three-object.service';
import { ThreeObjectController } from './three-object.controller';
import { ThreeObject } from './entities/three-object.entity';
import { ParkingLocation } from 'src/parking-location/entities/parking-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ThreeObject, ParkingLocation])],
  controllers: [ThreeObjectController],
  providers: [ThreeObjectService],
})
export class ThreeObjectModule {}
