import { Test, TestingModule } from '@nestjs/testing';
import { NexusController } from './nexus.controller';

describe('NexusController', () => {
  let controller: NexusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NexusController],
    }).compile();

    controller = module.get<NexusController>(NexusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
