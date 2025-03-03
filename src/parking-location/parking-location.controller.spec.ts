import { Test, TestingModule } from '@nestjs/testing';
import { ParkingLocationController } from './parking-location.controller';
import { ParkingLocationService } from './parking-location.service';

describe('ParkingLocationController', () => {
  let controller: ParkingLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingLocationController],
      providers: [ParkingLocationService],
    }).compile();

    controller = module.get<ParkingLocationController>(ParkingLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
