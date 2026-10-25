import { Test, TestingModule } from '@nestjs/testing';
import { JenisKendaraanController } from './jenis-kendaraan.controller.js';

describe('JenisKendaraanController', () => {
  let controller: JenisKendaraanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenisKendaraanController],
    }).compile();

    controller = module.get<JenisKendaraanController>(JenisKendaraanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
