import { Test, TestingModule } from '@nestjs/testing';
import { ThreeObjectController } from './three-object.controller';
import { ThreeObjectService } from './three-object.service';

describe('ThreeObjectController', () => {
  let controller: ThreeObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreeObjectController],
      providers: [ThreeObjectService],
    }).compile();

    controller = module.get<ThreeObjectController>(ThreeObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
