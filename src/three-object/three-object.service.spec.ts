import { Test, TestingModule } from '@nestjs/testing';
import { ThreeObjectService } from './three-object.service';

describe('ThreeObjectService', () => {
  let service: ThreeObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThreeObjectService],
    }).compile();

    service = module.get<ThreeObjectService>(ThreeObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
