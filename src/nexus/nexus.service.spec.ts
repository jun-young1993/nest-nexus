import { Test, TestingModule } from '@nestjs/testing';
import { NexusService } from './nexus.service';

describe('NexusService', () => {
  let service: NexusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NexusService],
    }).compile();

    service = module.get<NexusService>(NexusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
