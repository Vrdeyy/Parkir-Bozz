import { Module } from '@nestjs/common';
import { AreaParkirController } from './area-parkir.controller.js';
import { AreaParkirService } from './area-parkir.service.js';

@Module({
  controllers: [AreaParkirController],
  providers: [AreaParkirService]
})
export class AreaParkirModule {}
