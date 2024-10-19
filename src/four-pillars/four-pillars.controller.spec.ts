import { Test, TestingModule } from '@nestjs/testing';
import { FourPillarsController } from './four-pillars.controller';
import { FourPillarsService } from './four-pillars.service';

describe('FourPillarsController', () => {
  let controller: FourPillarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FourPillarsController],
      providers: [FourPillarsService],
    }).compile();

    controller = module.get<FourPillarsController>(FourPillarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
