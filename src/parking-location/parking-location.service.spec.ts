import { Test, TestingModule } from '@nestjs/testing';
import { ParkingLocationService } from './parking-location.service';

describe('ParkingLocationService', () => {
  let service: ParkingLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingLocationService],
    }).compile();

    service = module.get<ParkingLocationService>(ParkingLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
