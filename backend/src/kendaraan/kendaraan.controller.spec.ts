import { Test, TestingModule } from '@nestjs/testing';
import { KendaraanController } from './kendaraan.controller.js';

describe('KendaraanController', () => {
  let controller: KendaraanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KendaraanController],
    }).compile();

    controller = module.get<KendaraanController>(KendaraanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
