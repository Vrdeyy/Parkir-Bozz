import { Module } from '@nestjs/common';
import { KendaraanController } from './kendaraan.controller.js';
import { KendaraanService } from './kendaraan.service.js';

@Module({
  controllers: [KendaraanController],
  providers: [KendaraanService]
})
export class KendaraanModule {}
