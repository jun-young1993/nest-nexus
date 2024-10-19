import { Test, TestingModule } from '@nestjs/testing';
import { FourPillarsService } from './four-pillars.service';

describe('FourPillarsService', () => {
  let service: FourPillarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FourPillarsService],
    }).compile();

    service = module.get<FourPillarsService>(FourPillarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
