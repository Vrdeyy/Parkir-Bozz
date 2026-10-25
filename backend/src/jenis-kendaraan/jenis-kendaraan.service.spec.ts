import { Test, TestingModule } from '@nestjs/testing';
import { JenisKendaraanService } from './jenis-kendaraan.service.js';

describe('JenisKendaraanService', () => {
  let service: JenisKendaraanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JenisKendaraanService],
    }).compile();

    service = module.get<JenisKendaraanService>(JenisKendaraanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
