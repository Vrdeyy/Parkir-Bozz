
import { Module } from '@nestjs/common';
import { JenisKendaraanController } from './jenis-kendaraan.controller.js';
import { JenisKendaraanService } from './jenis-kendaraan.service.js';

@Module({
  controllers: [JenisKendaraanController],
  providers: [JenisKendaraanService],
})
export class JenisKendaraanModule { }
