import { Test, TestingModule } from '@nestjs/testing';
import { AreaParkirService } from './area-parkir.service.js';

describe('AreaParkirService', () => {
  let service: AreaParkirService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AreaParkirService],
    }).compile();

    service = module.get<AreaParkirService>(AreaParkirService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
