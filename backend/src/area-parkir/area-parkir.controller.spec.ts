import { Test, TestingModule } from '@nestjs/testing';
import { AreaParkirController } from './area-parkir.controller.js';

describe('AreaParkirController', () => {
  let controller: AreaParkirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AreaParkirController],
    }).compile();

    controller = module.get<AreaParkirController>(AreaParkirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
